"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cardPointerEffect } from "@/utils/animations";

interface TiltCardProps {
  children: ReactNode;
  tilt?: boolean;
}

// The outer element stays still as the pointer's hit area. Measuring the tilting
// surface instead would move its edges under the cursor and make the hover flicker.
export default function TiltCard({ children, tilt = true }: TiltCardProps) {
  const hitAreaRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hitAreaRef.current || !surfaceRef.current) return;
    return cardPointerEffect(hitAreaRef.current, surfaceRef.current, { tilt });
  }, [tilt]);

  return (
    <div ref={hitAreaRef} className="h-full">
      <div ref={surfaceRef} className="relative h-full">
        {children}
        <span aria-hidden="true" className="card-glow" />
      </div>
    </div>
  );
}
