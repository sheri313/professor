"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { useLenis } from "@/components/hero/useLenis";

interface MotionProviderProps {
  children: ReactNode;
}

export default function MotionProvider({ children }: MotionProviderProps) {
  useLenis();

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
