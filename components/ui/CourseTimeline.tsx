"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { prefersReducedMotion } from "@/utils/animations";

interface CourseTimelineProps {
  children: ReactNode;
}

// The line's tip and the course nodes all meet this height in the viewport.
const READING_LINE = "62%";

// Draws the rail as the page scrolls and marks each [data-course] once the line
// reaches it. The filled rail is the server default, so it's complete without JavaScript.
export default function CourseTimeline({ children }: CourseTimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    const tip = tipRef.current;
    if (!root || !fill || !tip) return;

    const courses = gsap.utils.toArray<HTMLElement>("[data-course]", root);

    if (prefersReducedMotion()) {
      courses.forEach((course) => course.toggleAttribute("data-reached", true));
      return;
    }

    const context = gsap.context(() => {
      const railRange = {
        trigger: root,
        start: `top ${READING_LINE}`,
        end: `bottom ${READING_LINE}`,
        scrub: 0.4,
      };

      gsap.fromTo(
        fill,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: railRange },
      );

      gsap.fromTo(
        tip,
        { y: 0 },
        {
          y: () => root.offsetHeight,
          ease: "none",
          scrollTrigger: { ...railRange, invalidateOnRefresh: true },
        },
      );

      courses.forEach((course) => {
        ScrollTrigger.create({
          trigger: course,
          start: `top ${READING_LINE}`,
          end: "max",
          onToggle: ({ isActive }) => course.toggleAttribute("data-reached", isActive),
        });
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-3 w-px bg-white/10 lg:left-[calc(9rem+2.25rem)]"
      >
        <div
          ref={fillRef}
          className="size-full origin-top bg-linear-to-b from-accent-300 via-accent-400 to-accent-500 shadow-[0_0_14px_2px] shadow-accent-400/60"
        />
        <div
          ref={tipRef}
          className="absolute -left-1.25 -top-1.25 size-2.75 rounded-full bg-accent-100 shadow-[0_0_18px_5px] shadow-accent-300/80"
        />
      </div>
      {children}
    </div>
  );
}
