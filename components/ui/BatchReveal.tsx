"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { batchReveal } from "@/utils/sectionMotion";

interface BatchRevealProps {
  children: ReactNode;
  className?: string;
}

// Reveals its [data-batch] descendants, so sections stay Server Components and keep
// their own layout. Each target also needs the gsap-reveal class to start hidden.
export default function BatchReveal({ children, className = "" }: BatchRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return batchReveal(ref.current);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
