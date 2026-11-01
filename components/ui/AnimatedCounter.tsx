"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

function formatCount(count: number, suffix: string): string {
  return `${Math.round(count).toLocaleString("en-US")}${suffix}`;
}

export default function AnimatedCounter({ value, suffix = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || reducedMotion) return;

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = formatCount(latest, suffix);
      },
    });

    return () => controls.stop();
  }, [inView, reducedMotion, value, suffix]);

  // The final value renders on the server so no-JS, print, and crawlers see real numbers.
  return <span ref={ref}>{formatCount(value, suffix)}</span>;
}
