// ============================================================
// Hero Scene Settings
//
// Colors, speeds, and quality budgets for the 3D hero live here, so tuning the look
// never means reading shader code. The matching CSS colors are the --hero-* variables
// at the top of the hero block in app/globals.css.
// ============================================================

// Written by the DOM layer (GSAP and the pointer) and read by the scene each frame, so
// scrolling and moving the mouse never cause a React render.
export interface HeroMotion {
  enter: number; // 0 below its resting place, 1 settled
  scroll: number; // 0 at the top of the page, 1 once the hero has scrolled away
  pointerX: number; // -1 left edge to 1 right edge
  pointerY: number; // -1 bottom edge to 1 top edge
}

export const initialHeroMotion: HeroMotion = { enter: 0, scroll: 0, pointerX: 0, pointerY: 0 };

export const heroColors = {
  backdropDeep: "#060a14",
  backdropHaze: "#0f1c33",
  glass: "#e6f7ff",
  glassEdge: "#9eeeff",
  rimCyan: "#38e8ff",
  rimViolet: "#8b5cf6",
};

export const heroSpeeds = {
  idleSpin: 0.14, // radians a second
  latticeSpin: -0.09, // turns against the glass, so the two read as separate layers
  ringSpin: 0.22,
  floatHeight: 0.06,
  pointerTilt: 0.34, // radians at the edge of the screen
  pointerResponse: 3.2, // higher catches up to the cursor faster
  scrollTurn: Math.PI * 0.85,
  scrollTilt: 0.5,
  scrollZoom: 0.42,
  cameraDrift: 1.5,
};

export type DeviceTier = "high" | "low" | "none";

export interface QualityBudget {
  dpr: [number, number];
  antialias: boolean;
  transmissionScale: number; // share of the canvas the glass refracts at
  dust: number;
  networkNodes: number;
}

export const heroQuality: Record<Exclude<DeviceTier, "none">, QualityBudget> = {
  high: {
    dpr: [1, 1.75],
    antialias: true,
    transmissionScale: 0.75,
    dust: 700,
    networkNodes: 34,
  },
  low: {
    dpr: [1, 1.25],
    antialias: false,
    transmissionScale: 0.5,
    dust: 180,
    networkNodes: 14,
  },
};

const LOW_CPU_CORES = 4;
const LOW_MEMORY_GB = 4;
const LOW_END_WIDTH = 768;

// Only runs in the browser, because the scene that calls it is loaded with ssr: false.
export function detectDeviceTier(): DeviceTier {
  const context = document.createElement("canvas").getContext("webgl2");
  if (!context) return "none";

  const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
  const renderer = debugInfo ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : "";
  context.getExtension("WEBGL_lose_context")?.loseContext();

  const { hardwareConcurrency, deviceMemory, connection } = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  const isLowEnd =
    /swiftshader|llvmpipe|software/i.test(renderer) ||
    window.innerWidth < LOW_END_WIDTH ||
    window.matchMedia("(pointer: coarse)").matches ||
    hardwareConcurrency <= LOW_CPU_CORES ||
    (deviceMemory ?? LOW_MEMORY_GB + 1) <= LOW_MEMORY_GB ||
    connection?.saveData === true;

  return isLowEnd ? "low" : "high";
}
