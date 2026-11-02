import type { ReactNode } from "react";
import TiltCard from "@/components/ui/TiltCard";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

// The frosted panel lives in .glass-card. TiltCard adds the hover tilt and the
// cursor-following light, and leaves touch screens with the still card.
export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <TiltCard>
      <div className={`glass-card ${className}`}>{children}</div>
    </TiltCard>
  );
}
