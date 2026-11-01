"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(CustomEase, ScrollTrigger);

// cubic-bezier(0.16, 1, 0.3, 1)
export const SMOOTH_EASE = CustomEase.create("smoothEase", "M0,0 C0.16,1 0.3,1 1,1");

interface FadeInUpOptions {
  distance?: number;
  duration?: number;
  delay?: number;
  ease?: gsap.TweenVars["ease"];
}

interface StaggerRevealOptions extends FadeInUpOptions {
  stagger?: gsap.TweenVars["stagger"];
}

interface ScrollRevealOptions extends FadeInUpOptions {
  start?: string;
}

interface CountUpOptions {
  suffix?: string;
  duration?: number;
}

interface MagneticEffectOptions {
  strength?: number;
  duration?: number;
  ease?: gsap.TweenVars["ease"];
}

interface RevealStates {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
}

let pageHeightObserver: ResizeObserver | undefined;

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function formatCount(count: number, suffix = ""): string {
  return `${Math.round(count).toLocaleString("en-US")}${suffix}`;
}

// Opacity rather than autoAlpha: visibility: hidden would remove content from
// screen readers, find-in-page, and keyboard focus until it scrolled into view.
// Reduced motion keeps the fade and drops the movement, matching MotionProvider.
export function getRevealStates(distance = 24): RevealStates {
  document.documentElement.classList.add("gsap-ready");

  return {
    from: { opacity: 0, y: prefersReducedMotion() ? 0 : distance },
    to: { opacity: 1, y: 0, clearProps: "transform" },
  };
}

// Scroll triggers store page offsets, so re-measure when content above them
// changes height, such as when the publication filters shrink the list.
function watchPageHeight() {
  if (pageHeightObserver) return;

  // A refresh scrolls to 0 and back, which cancels a smooth anchor scroll. GSAP's
  // load refreshes force that, so they'd strand deep links partway down the page.
  // This observer covers late layout changes, and refresh(true) waits for scrollEnd.
  ScrollTrigger.config({ autoRefreshEvents: "resize,visibilitychange" });

  let refreshTimer: ReturnType<typeof setTimeout>;
  pageHeightObserver = new ResizeObserver(() => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(true), 150);
  });
  pageHeightObserver.observe(document.body);
}

function revealFrom(
  target: gsap.TweenTarget,
  { distance, duration = 0.8, delay = 0, ease = SMOOTH_EASE }: FadeInUpOptions,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  const { from, to } = getRevealStates(distance);
  return gsap.fromTo(target, from, { ...to, duration, delay, ease, ...vars });
}

// Call these from useLayoutEffect so targets are hidden before the first paint,
// and revert the returned tween in the effect's cleanup.
export function fadeInUp(target: gsap.TweenTarget, options: FadeInUpOptions = {}): gsap.core.Tween {
  return revealFrom(target, options);
}

export function staggerReveal(
  targets: gsap.TweenTarget,
  { stagger = 0.08, ...options }: StaggerRevealOptions = {},
): gsap.core.Tween {
  return revealFrom(targets, options, { stagger });
}

export function scrollReveal(
  target: HTMLElement,
  { start = "top 88%", ...options }: ScrollRevealOptions = {},
): gsap.core.Tween {
  watchPageHeight();
  return revealFrom(target, options, { scrollTrigger: { trigger: target, start, once: true } });
}

export function countUp(
  element: HTMLElement,
  value: number,
  { suffix = "", duration = 1.6 }: CountUpOptions = {},
): gsap.core.Tween {
  const counter = { value: 0 };

  return gsap.to(counter, {
    value,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = formatCount(counter.value, suffix);
    },
  });
}

// Returns a cleanup function that removes the listeners and resets the element.
export function magneticEffect(
  element: HTMLElement,
  { strength = 0.3, duration = 0.4, ease = "power3.out" }: MagneticEffectOptions = {},
): () => void {
  if (prefersReducedMotion()) return () => {};

  const moveX = gsap.quickTo(element, "x", { duration, ease });
  const moveY = gsap.quickTo(element, "y", { duration, ease });

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;

    // Measure from the resting position, or the element's own offset feeds back in.
    const { left, top, width, height } = element.getBoundingClientRect();
    const restingX = left - Number(gsap.getProperty(element, "x"));
    const restingY = top - Number(gsap.getProperty(element, "y"));

    moveX((event.clientX - restingX - width / 2) * strength);
    moveY((event.clientY - restingY - height / 2) * strength);
  };

  const handlePointerLeave = () => {
    moveX(0);
    moveY(0);
  };

  element.addEventListener("pointermove", handlePointerMove);
  element.addEventListener("pointerleave", handlePointerLeave);

  return () => {
    element.removeEventListener("pointermove", handlePointerMove);
    element.removeEventListener("pointerleave", handlePointerLeave);
    gsap.killTweensOf(element, "x,y");
    gsap.set(element, { clearProps: "x,y" });
  };
}
