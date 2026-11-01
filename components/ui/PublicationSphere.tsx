"use client";

import { Html, useCursor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  CanvasTexture,
  Color,
  Euler,
  MathUtils,
  Quaternion,
  Vector3,
} from "three";
import type { Group, MeshBasicMaterial, Points, ShaderMaterial, SpriteMaterial } from "three";
import type { Publication, PublicationType } from "@/data/professorData";
import { prefersReducedMotion } from "@/utils/animations";

export interface ScrollSpin {
  x: number;
  y: number;
}

interface PublicationSphereProps extends SphereSceneProps {
  active: boolean;
}

interface SphereSceneProps {
  publications: Publication[];
  typeColors: Record<PublicationType, string>;
  matchingIds: ReadonlySet<string>;
  selectedId: string | null;
  previewId: string | null;
  spin: RefObject<ScrollSpin>;
  onSelect: (id: string) => void;
}

interface DataNodeProps {
  publication: Publication;
  position: Vector3;
  color: string;
  glowTexture: CanvasTexture;
  dimmed: boolean;
  emphasized: boolean;
  tooltip: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

const SPHERE_RADIUS = 2.4;
const CAMERA_FOV = 42;
// How much of the view the sphere leaves free, and how close the camera moves on a click.
const FIT_MARGIN = 1.32;
const FOCUS_DISTANCE_RATIO = 0.74;
const BASE_TILT = 0.32;
const IDLE_SPIN_SPEED = 0.05;
const ROTATION_RESPONSE = 4;
const DUST_COUNT = 420;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const CAMERA_FORWARD = new Vector3(0, 0, 1);

// Reused every frame, so the render loop allocates nothing for the collector to chase.
const nodeWorldPosition = new Vector3();
const focusDirection = new Vector3();
const targetEuler = new Euler();
const targetRotation = new Quaternion();

const shellVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vHeight;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    vHeight = normalize(position).y;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const shellFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vHeight;

  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
    float scanPosition = fract(uTime * 0.09) * 2.4 - 1.2;
    float scan = smoothstep(0.1, 0.0, abs(vHeight - scanPosition));
    gl_FragColor = vec4(uColor, rim * 0.6 + scan * 0.1);
  }
`;

// Spreads points evenly over a sphere, which random placement or a lat/long grid won't.
function getFibonacciPoint(index: number, count: number, radius: number): Vector3 {
  const y = 1 - ((index + 0.5) / count) * 2;
  const ringRadius = Math.sqrt(1 - y * y);
  const angle = index * GOLDEN_ANGLE;

  return new Vector3(Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius).multiplyScalar(
    radius,
  );
}

function createGlowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (context) {
    const glow = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "rgba(255, 255, 255, 1)");
    glow.addColorStop(0.25, "rgba(255, 255, 255, 0.55)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 64, 64);
  }

  return new CanvasTexture(canvas);
}

function DataNode({
  publication,
  position,
  color,
  glowTexture,
  dimmed,
  emphasized,
  tooltip,
  onHover,
  onSelect,
}: DataNodeProps) {
  const { id, title, venue } = publication;
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<MeshBasicMaterial>(null);
  const glowRef = useRef<SpriteMaterial>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useFrame((_, frameDelta) => {
    const group = groupRef.current;
    const core = coreRef.current;
    const glow = glowRef.current;
    if (!group || !core || !glow) return;

    const delta = Math.min(frameDelta, 0.1);
    const targetScale = dimmed ? 0.4 : emphasized ? 1.8 : 1;
    group.scale.setScalar(MathUtils.damp(group.scale.x, targetScale, 8, delta));

    // Nodes dim as they turn away, which gives the sphere its sense of depth.
    group.getWorldPosition(nodeWorldPosition);
    const nearSide = MathUtils.smoothstep(nodeWorldPosition.z, -SPHERE_RADIUS, SPHERE_RADIUS * 0.5);
    const targetOpacity = dimmed ? 0.12 : MathUtils.lerp(0.3, 1, nearSide);
    core.opacity = MathUtils.damp(core.opacity, targetOpacity, 8, delta);
    glow.opacity = core.opacity * 0.85;

    // Opens toward the sphere's middle, so it can't run off the top or bottom of the view.
    if (tooltipRef.current) {
      const offset = nodeWorldPosition.y > 0 ? "1.75rem" : "calc(-100% - 1.75rem)";
      tooltipRef.current.style.transform = `translate(-50%, ${offset})`;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Far larger than the visible dot, so the tooltip answers to being near a node. */}
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          if (!dimmed) onHover(id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(event) => {
          event.stopPropagation();
          if (!dimmed) onSelect(id);
        }}
      >
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <sprite scale={0.7}>
        <spriteMaterial
          ref={glowRef}
          map={glowTexture}
          color={color}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial ref={coreRef} color={color} transparent toneMapped={false} />
      </mesh>

      {tooltip && (
        <Html zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div
            ref={tooltipRef}
            className="w-60 rounded-xl border border-white/15 bg-slate-950/90 px-3 py-2 text-center shadow-xl shadow-black/40"
          >
            <p className="font-display text-sm font-bold leading-snug text-white">{title}</p>
            <p className="mt-1 text-xs italic leading-4 text-slate-300">{venue}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Dust() {
  const pointsRef = useRef<Points>(null);

  const coordinates = useMemo(() => {
    const values = new Float32Array(DUST_COUNT * 3);
    for (let index = 0; index < DUST_COUNT; index++) {
      // A fixed scatter rather than Math.random, so renders stay pure.
      const radius = SPHERE_RADIUS + 0.5 + Math.abs(Math.sin(index * 12.9898)) * 1.4;
      getFibonacciPoint(index, DUST_COUNT, radius).toArray(values, index * 3);
    }
    return values;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y -= delta * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[coordinates, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#6ee7b7" size={0.02} transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

function SphereScene({
  publications,
  typeColors,
  matchingIds,
  selectedId,
  previewId,
  spin,
  onSelect,
}: SphereSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [reducedMotion] = useState(prefersReducedMotion);
  const groupRef = useRef<Group>(null);
  const shellRef = useRef<ShaderMaterial>(null);
  const idleSpin = useRef(0);
  const aspect = useThree((state) => state.size.width / state.size.height);

  const glowTexture = useMemo(() => createGlowTexture(), []);
  const shellUniforms = useMemo(
    () => ({ uColor: { value: new Color("#34d399") }, uTime: { value: 0 } }),
    [],
  );
  // Newest at the north pole. Positions come from the full list, not the filtered one,
  // so a node keeps its place while filters dim the others around it.
  const positions = useMemo(
    () =>
      publications.map((_, index) => getFibonacciPoint(index, publications.length, SPHERE_RADIUS)),
    [publications],
  );

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);
  useCursor(hoveredId !== null);

  const tooltipId = selectedId ? null : (hoveredId ?? previewId);
  const focus = positions[publications.findIndex(({ id }) => id === selectedId)];
  const restDistance =
    (SPHERE_RADIUS * FIT_MARGIN) /
    (Math.tan(MathUtils.degToRad(CAMERA_FOV / 2)) * Math.min(1, aspect));

  useFrame(({ camera, clock }, frameDelta) => {
    const group = groupRef.current;
    if (!group) return;

    const delta = Math.min(frameDelta, 0.1);

    if (focus) {
      // Turns the clicked node to face the camera, whatever the scroll position is.
      targetRotation.setFromUnitVectors(focusDirection.copy(focus).normalize(), CAMERA_FORWARD);
    } else {
      if (!reducedMotion && !tooltipId) idleSpin.current += delta * IDLE_SPIN_SPEED;
      targetEuler.set(BASE_TILT + spin.current.x, spin.current.y + idleSpin.current, 0);
      targetRotation.setFromEuler(targetEuler);
    }

    group.quaternion.slerp(targetRotation, 1 - Math.exp(-delta * ROTATION_RESPONSE));

    const distance = restDistance * (focus ? FOCUS_DISTANCE_RATIO : 1);
    camera.position.z = MathUtils.damp(camera.position.z, distance, 3, delta);

    if (shellRef.current) shellRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      <Dust />
      <group ref={groupRef}>
        <mesh>
          <icosahedronGeometry args={[SPHERE_RADIUS, 4]} />
          <meshBasicMaterial
            color="#34d399"
            wireframe
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[SPHERE_RADIUS * 0.995, 48, 48]} />
          <shaderMaterial
            ref={shellRef}
            uniforms={shellUniforms}
            vertexShader={shellVertexShader}
            fragmentShader={shellFragmentShader}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {publications.map((publication, index) => (
          <DataNode
            key={publication.id}
            publication={publication}
            position={positions[index]}
            color={typeColors[publication.type]}
            glowTexture={glowTexture}
            dimmed={!matchingIds.has(publication.id)}
            emphasized={publication.id === (selectedId ?? tooltipId)}
            tooltip={publication.id === tooltipId}
            onHover={setHoveredId}
            onSelect={onSelect}
          />
        ))}
      </group>
    </>
  );
}

// Lazy-loaded by Publications, so three.js and R3F never weigh on the first page load.
// Unmounting the Canvas has R3F dispose the scene and release the WebGL context.
export default function PublicationSphere({ active, ...scene }: PublicationSphereProps) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ fov: CAMERA_FOV, position: [0, 0, 9], near: 0.1, far: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
      }}
      // Lets a finger on the sphere still scroll the page, which is what turns it.
      style={{ touchAction: "pan-y" }}
    >
      <SphereScene {...scene} />
    </Canvas>
  );
}
