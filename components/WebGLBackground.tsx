"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/utils/animations";

type ThreeModule = typeof import("three");

interface NetworkGraph {
  nodes: Float32Array;
  edges: Float32Array;
}

interface SectionScene {
  opacity: string;
  spin: number;
  color: number;
}

// Each section sets its own mood. The canvas sits over section backgrounds, so it
// fades right down behind the text-heavy ones and comes up where it can be the show.
const sectionScenes: Record<string, SectionScene> = {
  top: { opacity: "0.35", spin: 0.03, color: 0x34d399 },
  about: { opacity: "0.2", spin: 0.012, color: 0x10b981 },
  research: { opacity: "0.38", spin: 0.09, color: 0x6ee7b7 },
  publications: { opacity: "0.08", spin: 0.008, color: 0x38bdf8 },
  team: { opacity: "0.1", spin: 0.02, color: 0x10b981 },
  teaching: { opacity: "0.22", spin: 0.05, color: 0x2dd4bf },
  contact: { opacity: "0.06", spin: 0.01, color: 0x10b981 },
};

const CANVAS_OPACITY = "0.35";
const START_EVENTS = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"];
const FRAME_INTERVAL_MS = 1000 / 30;
const MAX_PIXEL_RATIO = 1.5;
const CAMERA_DISTANCE = 30;
const CAMERA_FOV = 50;
const VIEW_SPREAD = 1.2;
const DEPTH_SPREAD = 16;
const MAX_LINKS_PER_NODE = 3;
const MAX_LINK_DISTANCE = 11;
const MAX_POINTER_TILT = 0.3;
const POINTER_RESPONSE = 2.5;
const IDLE_ROTATION_SPEED = 0.03;
const MOBILE_RESIZE_TOLERANCE = 120;

function createGraph(nodeCount: number, aspect: number): NetworkGraph {
  const viewHeight = 2 * CAMERA_DISTANCE * Math.tan((CAMERA_FOV * Math.PI) / 360);
  const spreadY = viewHeight * VIEW_SPREAD;
  const spreadX = spreadY * aspect;

  const nodes = new Float32Array(nodeCount * 3);
  for (let index = 0; index < nodeCount; index++) {
    nodes[index * 3] = (Math.random() - 0.5) * spreadX;
    nodes[index * 3 + 1] = (Math.random() - 0.5) * spreadY;
    nodes[index * 3 + 2] = (Math.random() - 0.5) * DEPTH_SPREAD;
  }

  const distanceBetween = (a: number, b: number) =>
    Math.hypot(
      nodes[a * 3] - nodes[b * 3],
      nodes[a * 3 + 1] - nodes[b * 3 + 1],
      nodes[a * 3 + 2] - nodes[b * 3 + 2],
    );

  const edges: number[] = [];
  for (let index = 0; index < nodeCount; index++) {
    const nearest = Array.from({ length: nodeCount }, (_, other) => other)
      .filter((other) => other !== index && distanceBetween(index, other) < MAX_LINK_DISTANCE)
      .sort((a, b) => distanceBetween(index, a) - distanceBetween(index, b))
      .slice(0, MAX_LINKS_PER_NODE);

    for (const other of nearest) {
      edges.push(
        nodes[index * 3],
        nodes[index * 3 + 1],
        nodes[index * 3 + 2],
        nodes[other * 3],
        nodes[other * 3 + 1],
        nodes[other * 3 + 2],
      );
    }
  }

  return { nodes, edges: new Float32Array(edges) };
}

function createGlowCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (context) {
    const glow = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "rgba(255, 255, 255, 1)");
    glow.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 64, 64);
  }

  return canvas;
}

function supportsWebGL(): boolean {
  const context = document.createElement("canvas").getContext("webgl2");
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  return context !== null;
}

// Returns a cleanup function that stops rendering and releases every GPU resource.
function startNetwork(THREE: ThreeModule, container: HTMLDivElement): () => void {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  let viewWidth = container.clientWidth;
  let viewHeight = container.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(viewWidth, viewHeight, false);
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, viewWidth / viewHeight, 0.1, 100);
  camera.position.z = CAMERA_DISTANCE;

  const { nodes, edges } = createGraph(viewWidth < 768 ? 45 : 110, viewWidth / viewHeight);

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodes, 3));
  const glowTexture = new THREE.CanvasTexture(createGlowCanvas());
  const nodeMaterial = new THREE.PointsMaterial({
    color: 0x34d399,
    size: 0.9,
    map: glowTexture,
    transparent: true,
    depthWrite: false,
  });

  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute("position", new THREE.BufferAttribute(edges, 3));
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  const network = new THREE.Group();
  network.add(new THREE.Points(nodeGeometry, nodeMaterial));
  network.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));
  scene.add(network);

  const animated = !prefersReducedMotion();
  const pointer = { x: 0, y: 0 };
  const targetColor = new THREE.Color(0x34d399);
  let frameId = 0;
  let lastFrameTime = 0;
  let idleRotation = 0;
  let spin = IDLE_ROTATION_SPEED;
  let targetSpin = IDLE_ROTATION_SPEED;

  const applyScene = ({ opacity, spin: nextSpin, color }: SectionScene) => {
    container.style.opacity = opacity;
    targetSpin = nextSpin;
    targetColor.set(color);

    // Without the animation loop nothing would ever ease toward the new color.
    if (!animated) {
      nodeMaterial.color.copy(targetColor);
      edgeMaterial.color.copy(targetColor);
      renderer.render(scene, camera);
    }
  };

  // The same thin band as the navbar, so the scene changes with the active section.
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      const entered = entries.find(({ isIntersecting }) => isIntersecting);
      if (entered) applyScene(sectionScenes[entered.target.id]);
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  const handleMouseMove = (event: MouseEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const handleResize = () => {
    const widthChanged = container.clientWidth !== viewWidth;
    const heightChange = Math.abs(container.clientHeight - viewHeight);

    // Mobile address bars resize the window while scrolling. The canvas stretches
    // to cover that gap, which is cheaper and steadier than a new drawing buffer.
    if (!widthChanged && heightChange < MOBILE_RESIZE_TOLERANCE) return;

    viewWidth = container.clientWidth;
    viewHeight = container.clientHeight;
    camera.aspect = viewWidth / viewHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewWidth, viewHeight, false);
    renderer.render(scene, camera);
  };

  // Gentle motion doesn't need 60fps, and a full-screen canvas runs the whole visit.
  const animate = (time: number) => {
    frameId = requestAnimationFrame(animate);
    if (time - lastFrameTime < FRAME_INTERVAL_MS) return;

    const delta = Math.min((time - lastFrameTime) / 1000, 0.1);
    lastFrameTime = time;
    idleRotation += delta * spin;

    const smoothing = 1 - Math.exp(-delta * POINTER_RESPONSE);
    const targetX = pointer.y * MAX_POINTER_TILT;
    const targetY = idleRotation + pointer.x * MAX_POINTER_TILT;
    network.rotation.x += (targetX - network.rotation.x) * smoothing;
    network.rotation.y += (targetY - network.rotation.y) * smoothing;
    spin += (targetSpin - spin) * smoothing;
    nodeMaterial.color.lerp(targetColor, smoothing);
    edgeMaterial.color.lerp(targetColor, smoothing);

    renderer.render(scene, camera);
  };

  window.addEventListener("resize", handleResize);
  renderer.render(scene, camera);

  if (animated) {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    frameId = requestAnimationFrame(animate);
  }

  container.style.opacity = CANVAS_OPACITY;

  Object.keys(sectionScenes).forEach((id) => {
    const section = document.getElementById(id);
    if (section) sceneObserver.observe(section);
  });

  return () => {
    cancelAnimationFrame(frameId);
    sceneObserver.disconnect();
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("mousemove", handleMouseMove);

    nodeGeometry.dispose();
    nodeMaterial.dispose();
    edgeGeometry.dispose();
    edgeMaterial.dispose();
    glowTexture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    container.style.opacity = "";
  };
}

export default function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let stopNetwork: (() => void) | undefined;
    let unmounted = false;

    // Three.js is large, so it only loads once someone starts using the page.
    const start = async () => {
      removeStartListeners();
      if (!supportsWebGL()) return;

      try {
        const THREE = await import("three");
        if (!unmounted) stopNetwork = startNetwork(THREE, container);
      } catch {
        // No WebGL or a failed download only costs the decoration, so the page carries on.
      }
    };

    const removeStartListeners = () => {
      START_EVENTS.forEach((type) => window.removeEventListener(type, start));
    };

    START_EVENTS.forEach((type) => window.addEventListener(type, start, { passive: true }));

    return () => {
      unmounted = true;
      removeStartListeners();
      stopNetwork?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-1 opacity-0 transition-opacity duration-1000 print:hidden"
    />
  );
}
