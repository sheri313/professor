"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { countUp, formatCount, prefersReducedMotion } from "@/utils/animations";

interface CountUpProps {
  value: number;
  suffix?: string;
}

// The server HTML holds the final number, so it's still right without JavaScript.
export default function CountUp({ value, suffix }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    let tween: gsap.core.Tween | undefined;
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top 88%",
      end: "max",
      onEnter: (self) => {
        self.kill();
        tween = countUp(element, value, { suffix });
      },
    });

    return () => {
      trigger.kill();
      tween?.kill();
      element.textContent = formatCount(value, suffix);
    };
  }, [value, suffix]);

  return <span ref={ref}>{formatCount(value, suffix)}</span>;
}
