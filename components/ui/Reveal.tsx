"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { scrollReveal } from "@/utils/animations";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const tween = scrollReveal(ref.current, { delay });
    return () => {
      tween.revert();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`gsap-reveal ${className}`}>
      {children}
    </div>
  );
}
