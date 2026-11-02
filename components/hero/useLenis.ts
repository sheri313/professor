"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/utils/animations";

// These scroll themselves. The publication dialog holds the wheel so the page behind it
// stays put, and a long message scrolls inside its textarea.
function keepsNativeWheel(node: HTMLElement): boolean {
  return node.tagName === "DIALOG" || node.tagName === "TEXTAREA";
}

// Runs Lenis on GSAP's ticker, so smooth scrolling and every ScrollTrigger share a clock.
// Touch screens keep their native scrolling, which is Lenis's default.
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ anchors: true, prevent: keepsNativeWheel });
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);
}
