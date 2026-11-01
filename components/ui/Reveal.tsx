"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { scrollReveal } from "@/utils/animations";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return scrollReveal(ref.current, { delay });
  }, [delay]);

  return (
    <div ref={ref} className={`gsap-reveal ${className}`}>
      {children}
    </div>
  );
}
