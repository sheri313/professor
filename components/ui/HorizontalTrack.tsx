"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalTrackProps {
  children: ReactNode;
  label: string;
  ghostText: string;
  // One link leaves each stop except the last, so this is also the number of cards.
  links: number;
}

interface Port {
  x: number;
  y: number;
}

// Matches the media query that gives .research-stage its scrolling height.
const STAGE_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

function getBoxWithin(element: HTMLElement, ancestor: HTMLElement) {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return { left, top, width: element.offsetWidth, height: element.offsetHeight };
}

function getLinkPath(from: Port, to: Port): string {
  const bend = (to.x - from.x) / 2;
  return `M${from.x} ${from.y}C${from.x + bend} ${from.y} ${to.x - bend} ${to.y} ${to.x} ${to.y}`;
}

// The children render on the server. Each [data-stop] among them is a node on the
// neural path. Without the stage query, such as on touch screens, the track stays
// a native snap carousel and none of this runs.
export default function HorizontalTrack({ children, label, ghostText, links }: HorizontalTrackProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const ghost = ghostRef.current;
    const bar = barRef.current;
    const counter = counterRef.current;
    if (!stage || !viewport || !track || !ghost || !bar || !counter) return;

    const media = gsap.matchMedia();

    media.add(STAGE_QUERY, () => {
      const stops = gsap.utils.toArray<HTMLElement>("[data-stop]", track);
      const cards = stops.slice(1);
      const wires = gsap.utils.toArray<SVGPathElement>("[data-wire]", track);
      const pulses = gsap.utils.toArray<SVGPathElement>("[data-pulse]", track);
      const synapses = gsap.utils.toArray<SVGCircleElement>("[data-synapse]", track);

      // Measured from layout, so a card's tilt or reveal can't bend the wires.
      const drawLinks = () => {
        cards.forEach((card, index) => {
          const from = getBoxWithin(stops[index], track);
          const to = getBoxWithin(card, track);
          const start = { x: from.left + from.width, y: from.top + from.height / 2 };
          const end = { x: to.left, y: to.top + to.height / 2 };
          const path = getLinkPath(start, end);

          wires[index].setAttribute("d", path);
          pulses[index].setAttribute("d", path);
          synapses[index].setAttribute("cx", String(end.x));
          synapses[index].setAttribute("cy", String(end.y));
        });
      };

      const getDistance = () => Math.max(0, track.offsetWidth - viewport.clientWidth);
      const setBar = gsap.quickSetter(bar, "scaleX");
      let activeStop = 1;

      gsap.set(viewport, { overflow: "clip" });
      viewport.removeAttribute("tabindex");
      drawLinks();

      const stageRange = { trigger: stage, start: "top top", end: "bottom bottom" };

      const scroll = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: { ...stageRange, scrub: 0.8, invalidateOnRefresh: true, onRefresh: drawLinks },
      });

      // Follows the tween rather than the trigger, to stay in step with the scrub's lag.
      // Added afterward because a scrubbed tween first updates while it's being created.
      scroll.eventCallback("onUpdate", () => {
        const progress = scroll.progress();
        setBar(progress);

        const stop = 1 + Math.round(progress * (cards.length - 1));
        if (stop === activeStop) return;
        activeStop = stop;
        counter.textContent = String(stop).padStart(2, "0");
      });

      gsap.to(ghost, {
        xPercent: -28,
        ease: "none",
        scrollTrigger: { ...stageRange, scrub: 1.4 },
      });

      cards.forEach((card, index) => {
        const horizontal = { trigger: card, containerAnimation: scroll, scrub: true };

        gsap.fromTo(
          card,
          { opacity: 0.12, scale: 0.9, rotationY: -22, transformPerspective: 1200 },
          {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            ease: "none",
            scrollTrigger: { ...horizontal, start: "left 98%", end: "left 64%" },
          },
        );

        // A separate range for each link, so only the wire being drawn repaints.
        gsap.fromTo(
          pulses[index],
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { ...horizontal, start: "left 100%", end: "left 72%" },
          },
        );

        gsap.fromTo(
          synapses[index],
          { opacity: 0, scale: 0, transformOrigin: "50% 50%" },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: { ...horizontal, start: "left 74%", end: "left 70%" },
          },
        );
      });

      return () => {
        viewport.setAttribute("tabindex", "0");
      };
    });

    return () => media.revert();
  }, []);

  return (
    <div
      ref={stageRef}
      style={{ "--research-stops": links } as CSSProperties}
      className="research-stage"
    >
      <div className="relative z-10 flex flex-col justify-center overflow-clip py-20 lg:sticky lg:top-0 lg:h-svh lg:min-h-160 lg:py-0">
        <span
          ref={ghostRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 select-none whitespace-nowrap font-display text-[24vw] font-extrabold leading-none tracking-tighter text-white/[0.025] lg:block"
        >
          {ghostText}
        </span>

        {/* Focusable so keyboards can scroll it while it's a carousel. The stage drops
            this when it takes over, since its cards have nothing else to focus. */}
        <div
          ref={viewportRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          className="snap-x snap-mandatory overflow-x-auto scroll-px-(--research-pad) [scrollbar-color:var(--color-navy-600)_transparent] [scrollbar-width:thin]"
        >
          <div ref={trackRef} className="research-track relative">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
            >
              {Array.from({ length: links }, (_, index) => (
                <g key={index}>
                  <path data-wire fill="none" strokeDasharray="2 7" className="stroke-white/15" />
                  <path
                    data-pulse
                    fill="none"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1}
                    strokeLinecap="round"
                    strokeWidth={2}
                    className="stroke-accent-400"
                  />
                  <circle data-synapse r={5} opacity={0} className="fill-accent-300" />
                </g>
              ))}
            </svg>
            {children}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-(--research-pad) bottom-8 hidden items-center gap-4 font-mono text-xs text-navy-300 lg:motion-safe:flex"
        >
          <span>
            <span ref={counterRef}>01</span> / {String(links).padStart(2, "0")}
          </span>
          <span className="h-px flex-1 bg-white/10">
            <span
              ref={barRef}
              className="block h-full origin-left scale-x-0 bg-linear-to-r from-accent-500 to-accent-300"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
