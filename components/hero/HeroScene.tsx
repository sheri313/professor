"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  EdgesGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  MathUtils,
  Object3D,
  Quaternion,
  Vector3,
  WebGLRenderTarget,
} from "three";
import type {
  BufferGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PointLight,
  ShaderMaterial,
  WebGLProgramParametersWithUniforms,
} from "three";
import {
  detectDeviceTier,
  heroColors,
  heroQuality,
  heroSpeeds,
} from "@/components/hero/config";
import type { DeviceTier, HeroMotion, QualityBudget } from "@/components/hero/config";
import { prefersReducedMotion } from "@/utils/animations";

interface HeroSceneProps {
  motionRef: RefObject<HeroMotion>;
  stageRef: RefObject<HTMLElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
  onReady: () => void;
}

interface Placement {
  x: number; // anchor center, as a share of the stage
  y: number;
  span: number; // anchor height, as a share of the stage
}

interface CrystalProps {
  motionRef: RefObject<HeroMotion>;
  placementRef: RefObject<Placement>;
  animated: boolean;
  tier: Exclude<DeviceTier, "none">;
}

interface LatticeProps {
  latticeRef: RefObject<Group | null>;
}

interface NetworkLayerProps {
  depth: number;
  spread: number;
  nodeCount: number;
  opacity: number;
  seed: number;
  glowTexture: CanvasTexture;
}

const CAMERA_FOV = 35;
const CAMERA_Z = 9;
const WORLD_HEIGHT = 2 * Math.tan(MathUtils.degToRad(CAMERA_FOV / 2)) * CAMERA_Z;
// The widest the crystal and its rings reach, which is what has to fit the DOM anchor.
const OBJECT_SPAN = 3.5;
const RESTING_ANGLE = 0.6;
const ENTER_DROP = 1.3;
const MAX_FRAME_DELTA = 0.05;
const GLASS_RADIUS = 1.32;
const LATTICE_RADIUS = 0.74;
const RING_RADII = [1.62, 1.82];
const CYAN = new Color(heroColors.rimCyan);
const VIOLET = new Color(heroColors.rimViolet);

const backdropVertexShader = /* glsl */ `
  varying vec3 vDirection;

  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Opaque on purpose: three only refracts what is opaque, so without this the glass
// would have nothing behind it and render black. The grain breaks up gradient banding.
const backdropFragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uHaze;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying vec3 vDirection;

  void main() {
    vec3 direction = normalize(vDirection);
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);

    vec3 color = mix(uDeep, uHaze, smoothstep(-0.32, 0.42, direction.y));
    color += uCyan * 0.09 * smoothstep(0.55, 0.0, distance(direction.xy, vec2(0.2, 0.08)));
    color += uViolet * 0.1 * smoothstep(0.6, 0.0, distance(direction.xy, vec2(0.36, -0.2)));
    color += (grain - 0.5) / 255.0;

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

// A studio described in math rather than a baked environment map. Three's clearcoat and
// iridescence layers sit on top of getIBLRadiance, so they keep working, but there is no
// PMREM blur, which on Windows held the main thread for over half a second. Thin strips,
// because a flat facet mirrors a broad light as one solid white pane.
const studioReflections = /* glsl */ `
  uniform vec3 uRimCyan;
  uniform vec3 uRimViolet;

  float studioStrip(float position, float center, float width, float softness) {
    return smoothstep(width + softness, width, abs(position - center));
  }

  vec3 studioLight(vec3 direction, float softness) {
    float blur = 0.03 + softness;
    float front = smoothstep(-0.1, 0.5, direction.z);

    vec3 light = vec3(0.012, 0.018, 0.03);
    light += uRimCyan * 6.0 * studioStrip(direction.x, -0.8, 0.13, blur);
    light += uRimViolet * 6.0 * studioStrip(direction.x, 0.8, 0.13, blur);
    light += vec3(5.5) * studioStrip(direction.y, 0.74, 0.035, blur);
    light += vec3(3.5) * studioStrip(direction.y + direction.z * 0.25, 0.46, 0.022, blur);
    light += uRimViolet * 2.5 * studioStrip(direction.y, -0.72, 0.09, blur);
    light += vec3(4.5) * front * studioStrip(direction.x, 0.3, 0.05, blur);
    light += vec3(4.0) * front * studioStrip(length(direction.xy - vec2(-0.36, -0.24)), 0.2, 0.012, blur);
    return light;
  }

  vec3 getIBLRadiance(const in vec3 viewDir, const in vec3 normal, const in float roughness) {
    vec3 reflected = normalize(mix(reflect(-viewDir, normal), normal, pow4(roughness)));
    return studioLight(transformDirectionByInverseViewMatrix(reflected, viewMatrix), roughness);
  }
`;

function applyStudioReflections(shader: WebGLProgramParametersWithUniforms) {
  shader.uniforms.uRimCyan = { value: CYAN };
  shader.uniforms.uRimViolet = { value: VIOLET };
  shader.fragmentShader = `#define USE_ENVMAP\n${shader.fragmentShader}`
    .replace("#include <envmap_common_pars_fragment>", "")
    .replace("#include <envmap_physical_pars_fragment>", studioReflections);
}

const dustVertexShader = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vec3 drifted = position;
    drifted.y = mod(position.y + uTime * (0.05 + 0.09 * aSeed) + 4.0, 8.0) - 4.0;
    drifted.x += sin(uTime * 0.18 + aSeed * 6.28) * 0.22;

    vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = (1.6 + 2.8 * aSeed) * uPixelRatio * (8.0 / -viewPosition.z);
    vAlpha = (0.2 + 0.6 * aSeed) * (0.55 + 0.45 * sin(uTime * 0.5 + aSeed * 40.0));
  }
`;

const dustFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float falloff = smoothstep(0.5, 0.05, distance(gl_PointCoord, vec2(0.5)));
    gl_FragColor = vec4(uColor, falloff * vAlpha);
  }
`;

// Seeded, so a render is pure and the layout is the same on every visit.
function createRandom(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createGlowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;

  const context = canvas.getContext("2d");
  if (context) {
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, "rgba(255, 255, 255, 1)");
    glow.addColorStop(0.3, "rgba(255, 255, 255, 0.35)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 128, 128);
  }

  return new CanvasTexture(canvas);
}

// Reads the nodes and edges off an icosphere, whose triangles repeat every shared vertex.
function buildLattice(radius: number, detail: number) {
  const source = new IcosahedronGeometry(radius, detail);
  const position = source.getAttribute("position");
  const nodeIds = new Map<string, number>();
  const nodes: Vector3[] = [];
  const edges = new Set<string>();
  const vertex = new Vector3();
  let triangle: number[] = [];

  for (let index = 0; index < position.count; index++) {
    vertex.fromBufferAttribute(position, index);
    const key = `${vertex.x.toFixed(3)},${vertex.y.toFixed(3)},${vertex.z.toFixed(3)}`;
    let id = nodeIds.get(key);

    if (id === undefined) {
      id = nodes.length;
      nodeIds.set(key, id);
      nodes.push(vertex.clone());
    }

    triangle.push(id);
    if (triangle.length === 3) {
      const [a, b, c] = triangle;
      for (const [from, to] of [[a, b], [b, c], [c, a]]) {
        edges.add(`${Math.min(from, to)}-${Math.max(from, to)}`);
      }
      triangle = [];
    }
  }

  source.dispose();

  const struts = [...edges].map((edge) => edge.split("-").map(Number) as [number, number]);
  return { nodes, struts };
}

function buildNetwork(nodeCount: number, spread: number, seed: number) {
  const random = createRandom(seed);
  const nodes = new Float32Array(nodeCount * 3);

  for (let index = 0; index < nodeCount; index++) {
    nodes[index * 3] = (random() - 0.5) * spread;
    nodes[index * 3 + 1] = (random() - 0.5) * spread * 0.62;
    nodes[index * 3 + 2] = (random() - 0.5) * 1.6;
  }

  const links: number[] = [];
  const linkReach = spread * 0.17;

  for (let from = 0; from < nodeCount; from++) {
    let linked = 0;
    for (let to = from + 1; to < nodeCount && linked < 3; to++) {
      const distance = Math.hypot(
        nodes[from * 3] - nodes[to * 3],
        nodes[from * 3 + 1] - nodes[to * 3 + 1],
      );
      if (distance < linkReach) {
        links.push(...nodes.subarray(from * 3, from * 3 + 3), ...nodes.subarray(to * 3, to * 3 + 3));
        linked++;
      }
    }
  }

  return { nodes, links: new Float32Array(links) };
}

function Backdrop() {
  const uniforms = useMemo(
    () => ({
      uDeep: { value: new Color(heroColors.backdropDeep) },
      uHaze: { value: new Color(heroColors.backdropHaze) },
      uCyan: { value: CYAN },
      uViolet: { value: VIOLET },
    }),
    [],
  );

  return (
    <mesh>
      <sphereGeometry args={[40, 24, 16]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={backdropVertexShader}
        fragmentShader={backdropFragmentShader}
      />
    </mesh>
  );
}

function InnerLattice({ latticeRef }: LatticeProps) {
  const { nodes, struts } = useMemo(() => buildLattice(LATTICE_RADIUS, 1), []);
  const nodesRef = useRef<InstancedMesh>(null);
  const strutsRef = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const nodeMesh = nodesRef.current;
    const strutMesh = strutsRef.current;
    if (!nodeMesh || !strutMesh) return;

    const dummy = new Object3D();
    const up = new Vector3(0, 1, 0);
    const direction = new Vector3();
    const tint = new Color();
    const tintFor = (point: Vector3) =>
      tint.lerpColors(CYAN, VIOLET, point.y / (2 * LATTICE_RADIUS) + 0.5);

    nodes.forEach((node, index) => {
      dummy.position.copy(node);
      dummy.quaternion.identity();
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      nodeMesh.setMatrixAt(index, dummy.matrix);
      nodeMesh.setColorAt(index, tintFor(node));
    });

    struts.forEach(([from, to], index) => {
      direction.subVectors(nodes[to], nodes[from]);
      dummy.position.copy(nodes[from]).addScaledVector(direction, 0.5);
      dummy.scale.set(1, direction.length(), 1);
      dummy.quaternion.copy(new Quaternion().setFromUnitVectors(up, direction.clone().normalize()));
      dummy.updateMatrix();
      strutMesh.setMatrixAt(index, dummy.matrix);
      strutMesh.setColorAt(index, tintFor(dummy.position));
    });

    nodeMesh.instanceMatrix.needsUpdate = true;
    strutMesh.instanceMatrix.needsUpdate = true;
    if (nodeMesh.instanceColor) nodeMesh.instanceColor.needsUpdate = true;
    if (strutMesh.instanceColor) strutMesh.instanceColor.needsUpdate = true;
  }, [nodes, struts]);

  return (
    <group ref={latticeRef}>
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodes.length]}>
        <icosahedronGeometry args={[0.042, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={strutsRef} args={[undefined, undefined, struts.length]}>
        <cylinderGeometry args={[0.0075, 0.0075, 1, 5, 1, true]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh>
        <icosahedronGeometry args={[0.07, 2]} />
        <meshBasicMaterial color={heroColors.rimCyan} toneMapped={false} />
      </mesh>
    </group>
  );
}

function NetworkLayer({ depth, spread, nodeCount, opacity, seed, glowTexture }: NetworkLayerProps) {
  const { nodes, links } = useMemo(
    () => buildNetwork(nodeCount, spread, seed),
    [nodeCount, spread, seed],
  );

  return (
    <group position-z={depth}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodes, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={heroColors.glassEdge}
          map={glowTexture}
          size={0.22}
          transparent
          opacity={opacity * 1.6}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[links, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={heroColors.rimViolet}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: new Color(heroColors.glassEdge) },
    }),
    [],
  );
  const { positions, seeds } = useMemo(() => {
    const random = createRandom(7);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let index = 0; index < count; index++) {
      positions[index * 3] = (random() - 0.5) * 16;
      positions[index * 3 + 1] = (random() - 0.5) * 8;
      positions[index * 3 + 2] = -9 + random() * 11;
      seeds[index] = random();
    }

    return { positions, seeds };
  }, [count]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={uniforms}
        vertexShader={dustVertexShader}
        fragmentShader={dustFragmentShader}
      />
    </points>
  );
}

function Crystal({ motionRef, placementRef, animated, tier }: CrystalProps) {
  const placedRef = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const glassRef = useRef<Group>(null);
  const latticeRef = useRef<Group>(null);
  const ringsRef = useRef<Group>(null);
  const cursorLightRef = useRef<PointLight>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const glassGeometry = useMemo(() => new IcosahedronGeometry(GLASS_RADIUS, 0), []);
  const edgeGeometry = useMemo(() => new EdgesGeometry(glassGeometry), [glassGeometry]);
  const glowTexture = useMemo(() => createGlowTexture(), []);

  useEffect(
    () => () => {
      glassGeometry.dispose();
      edgeGeometry.dispose();
      glowTexture.dispose();
    },
    [glassGeometry, edgeGeometry, glowTexture],
  );

  useFrame((state, frameDelta) => {
    const placed = placedRef.current;
    const tilt = tiltRef.current;
    const glass = glassRef.current;
    const lattice = latticeRef.current;
    const rings = ringsRef.current;
    if (!placed || !tilt || !glass || !lattice || !rings) return;

    const { camera, clock, size } = state;
    const { enter, scroll, pointerX, pointerY } = motionRef.current;
    const { x, y, span } = placementRef.current;
    const delta = Math.min(frameDelta, MAX_FRAME_DELTA);
    const settled = animated ? enter : 1;

    const worldWidth = WORLD_HEIGHT * (size.width / size.height);
    const scale = (span * WORLD_HEIGHT) / OBJECT_SPAN;
    const float = animated ? Math.sin(clock.elapsedTime * 0.7) * heroSpeeds.floatHeight : 0;

    placed.position.set(
      (x - 0.5) * worldWidth,
      (0.5 - y) * WORLD_HEIGHT + float - ENTER_DROP * (1 - settled),
      0,
    );
    placed.scale.setScalar(scale * (0.8 + 0.2 * settled) * (1 + scroll * heroSpeeds.scrollZoom));

    if (!animated) {
      glass.rotation.y = lattice.rotation.y = RESTING_ANGLE;
      return;
    }

    const follow = heroSpeeds.pointerResponse;
    pointer.current.x = MathUtils.damp(pointer.current.x, pointerX, follow, delta);
    pointer.current.y = MathUtils.damp(pointer.current.y, pointerY, follow, delta);
    const { x: pointX, y: pointY } = pointer.current;

    glass.rotation.y += delta * heroSpeeds.idleSpin;
    lattice.rotation.y += delta * heroSpeeds.latticeSpin;
    lattice.rotation.x += delta * heroSpeeds.latticeSpin * 0.6;
    rings.rotation.z += delta * heroSpeeds.ringSpin;

    tilt.rotation.x = -pointY * heroSpeeds.pointerTilt + scroll * heroSpeeds.scrollTilt;
    tilt.rotation.y = pointX * heroSpeeds.pointerTilt + scroll * heroSpeeds.scrollTurn;

    cursorLightRef.current?.position.set(pointX * worldWidth * 0.45, pointY * WORLD_HEIGHT * 0.45, 2.8);

    // Moving the camera rather than the layers is what makes depth read as parallax.
    camera.position.x = pointX * 0.24;
    camera.position.y = pointY * 0.16 - scroll * heroSpeeds.cameraDrift * 0.5;
    camera.position.z = CAMERA_Z - scroll * heroSpeeds.cameraDrift;
  });

  return (
    <>
      <group ref={placedRef}>
        <sprite position-z={-1.6} scale={7.5}>
          <spriteMaterial
            map={glowTexture}
            color={heroColors.rimViolet}
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>

        <group ref={tiltRef}>
          <group ref={glassRef}>
            <mesh geometry={glassGeometry}>
              {tier === "high" ? (
                <meshPhysicalMaterial
                  color={heroColors.glass}
                  transmission={1}
                  thickness={0.9}
                  ior={1.46}
                  roughness={0.06}
                  metalness={0}
                  clearcoat={1}
                  clearcoatRoughness={0.05}
                  iridescence={0.8}
                  iridescenceIOR={1.32}
                  iridescenceThicknessMinimum={140}
                  iridescenceThicknessMaximum={460}
                  attenuationColor={heroColors.glassEdge}
                  attenuationDistance={3.4}
                  flatShading
                  onBeforeCompile={applyStudioReflections}
                />
              ) : (
                <meshStandardMaterial
                  color={heroColors.glass}
                  transparent
                  opacity={0.26}
                  metalness={0.3}
                  roughness={0.14}
                  side={DoubleSide}
                  depthWrite={false}
                  flatShading
                  onBeforeCompile={applyStudioReflections}
                />
              )}
            </mesh>
            <lineSegments geometry={edgeGeometry}>
              <lineBasicMaterial
                color={heroColors.glassEdge}
                transparent
                opacity={0.42}
                depthWrite={false}
                blending={AdditiveBlending}
              />
            </lineSegments>
          </group>

          <InnerLattice latticeRef={latticeRef} />

          <group ref={ringsRef}>
            {RING_RADII.map((radius, index) => (
              <group key={radius} rotation={[1.2 + index * 0.75, index * 0.6, 0]}>
                <mesh>
                  <torusGeometry args={[radius, 0.0055, 6, 120]} />
                  <meshBasicMaterial
                    color={index === 0 ? heroColors.rimCyan : heroColors.rimViolet}
                    toneMapped={false}
                    transparent
                    opacity={0.62}
                  />
                </mesh>
                <mesh position={[radius, 0, 0]}>
                  <icosahedronGeometry args={[0.05, 1]} />
                  <meshBasicMaterial color={heroColors.glass} toneMapped={false} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>

      {/* Phones have no cursor to follow, so they skip the light and its shader cost. */}
      {tier === "high" && (
        <pointLight ref={cursorLightRef} position={[0, 0, 2.8]} color={heroColors.glass} intensity={14} />
      )}
    </>
  );
}

function NetworkField({ quality }: { quality: QualityBudget }) {
  const glowTexture = useMemo(() => createGlowTexture(), []);

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  return (
    <>
      <NetworkLayer depth={-2.5} spread={12} nodeCount={quality.networkNodes} opacity={0.11} seed={11} glowTexture={glowTexture} />
      <NetworkLayer depth={-6} spread={18} nodeCount={quality.networkNodes} opacity={0.075} seed={23} glowTexture={glowTexture} />
      <NetworkLayer depth={-12} spread={28} nodeCount={quality.networkNodes} opacity={0.05} seed={37} glowTexture={glowTexture} />
    </>
  );
}

// Trades sharpness for frame rate if the device turns out slower than its tier suggested.
function AdaptiveQuality() {
  const get = useThree((state) => state.get);

  return (
    <PerformanceMonitor
      onDecline={() => {
        const { gl, setDpr } = get();
        setDpr(1);
        gl.transmissionResolutionScale = heroQuality.low.transmissionScale;
      }}
    />
  );
}

// The glass refracts a copy of the opaque objects drawn to a render target, and that pass
// needs its own variant of their shaders, which compiling the scene doesn't cover.
function compileRefractionPass({ gl, scene, camera }: RootState): Promise<unknown> {
  const opaque: Object3D[] = [];

  scene.traverse((object) => {
    const { material } = object as Mesh<BufferGeometry, MeshPhysicalMaterial>;
    if (material && !material.transparent && !material.transmission) opaque.push(object);
  });

  const target = new WebGLRenderTarget(1, 1);
  gl.setRenderTarget(target);
  const passes = opaque.map((object) => gl.compileAsync(object, camera, scene));
  gl.setRenderTarget(null);
  target.dispose();

  return Promise.all(passes);
}

// Compiling the glass shader can take seconds on Windows, and the first render would hold
// the main thread for all of it, right through the headline reveal. This builds every
// shader in the background first, so nothing is drawn until they are ready, and gives the
// browser a turn between steps so they can't run together into one long task.
function ShaderWarmup({ refracts, onWarm }: { refracts: boolean; onWarm: () => void }) {
  const get = useThree((state) => state.get);

  useEffect(() => {
    let cancelled = false;
    const nextTask = () => new Promise((resolve) => setTimeout(resolve));

    const warm = async () => {
      await nextTask();
      const state = get();
      await state.gl.compileAsync(state.scene, state.camera);

      if (refracts) {
        await nextTask();
        await compileRefractionPass(state);
      }
    };

    warm()
      .catch(() => {}) // the first render will compile whatever this could not
      .finally(() => {
        if (!cancelled) onWarm();
      });

    return () => {
      cancelled = true;
    };
  }, [get, onWarm, refracts]);

  return null;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    // The second frame is the first one that has the environment map in it.
    let frameId = requestAnimationFrame(() => {
      frameId = requestAnimationFrame(onReady);
    });

    return () => cancelAnimationFrame(frameId);
  }, [onReady]);

  return null;
}

export default function HeroScene({ motionRef, stageRef, anchorRef, onReady }: HeroSceneProps) {
  const [tier] = useState(detectDeviceTier);
  const [animated] = useState(() => !prefersReducedMotion());
  const [onScreen, setOnScreen] = useState(true);
  const [warm, setWarm] = useState(false);
  const handleWarm = useCallback(() => setWarm(true), []);
  const placementRef = useRef<Placement>({ x: 0.72, y: 0.5, span: 0.6 });

  // Places the crystal over its slot in the DOM layout, so CSS decides where it sits at
  // every width and the scene never needs its own breakpoints.
  useEffect(() => {
    const stage = stageRef.current;
    const anchor = anchorRef.current;
    if (!stage || !anchor) return;

    const measure = () => {
      const stageBox = stage.getBoundingClientRect();
      const anchorBox = anchor.getBoundingClientRect();

      placementRef.current = {
        x: (anchorBox.left + anchorBox.width / 2 - stageBox.left) / stageBox.width,
        y: (anchorBox.top + anchorBox.height / 2 - stageBox.top) / stageBox.height,
        span: anchorBox.height / stageBox.height,
      };
    };

    const sizes = new ResizeObserver(measure);
    sizes.observe(stage);
    sizes.observe(anchor);
    measure();

    return () => sizes.disconnect();
  }, [stageRef, anchorRef]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const visibility = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    visibility.observe(stage);

    return () => visibility.disconnect();
  }, [stageRef]);

  if (tier === "none") return null;

  const quality = heroQuality[tier];
  const liveFrameloop = onScreen ? "always" : "never";

  return (
    <Canvas
      dpr={quality.dpr}
      frameloop={!warm ? "never" : animated ? liveFrameloop : "demand"}
      resize={{ scroll: false }}
      camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 80 }}
      gl={{
        alpha: false,
        antialias: quality.antialias,
        stencil: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.transmissionResolutionScale = quality.transmissionScale;
      }}
    >
      <Backdrop />
      <NetworkField quality={quality} />
      <Dust count={quality.dust} />
      <Crystal motionRef={motionRef} placementRef={placementRef} animated={animated} tier={tier} />
      <ShaderWarmup refracts={tier === "high"} onWarm={handleWarm} />
      {warm && <ReadySignal onReady={onReady} />}
      {/* Starts after the warmup, or the loading stall would read as a slow device. */}
      {warm && tier === "high" && animated && <AdaptiveQuality />}
    </Canvas>
  );
}
