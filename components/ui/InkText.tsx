"use client";

import gsap from "gsap";
import { Fragment, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/utils/animations";

interface InkTextProps {
  text: string;
  className?: string;
}

// Inks each word in as the paragraph scrolls past. The server HTML is fully dark, so
// it reads normally without JavaScript or with reduced motion.
export default function InkText({ text, className = "" }: InkTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: { trigger: element, start: "top 80%", end: "bottom 50%", scrub: 0.5 },
        },
      );
    }, element);

    return () => context.revert();
  }, []);

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span data-word>{word}</span>{" "}
        </Fragment>
      ))}
    </p>
  );
}
