"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowDown, ArrowRight, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { initialHeroMotion } from "@/components/hero/config";
import type { HeroMotion } from "@/components/hero/config";
import GlassCard from "@/components/hero/GlassCard";
import SceneBoundary from "@/components/hero/SceneBoundary";
import Avatar from "@/components/ui/Avatar";
import type { HeroProfile } from "@/data/profile";
import {
  formatCount,
  getRevealStates,
  magneticEffect,
  prefersReducedMotion,
} from "@/utils/animations";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface HeroProps {
  profile: HeroProfile;
}

// Three.js is large, so the scene arrives in its own chunk after the text has painted.
const HeroScene = dynamic(() => import("@/components/hero/HeroScene"), { ssr: false });

const INTRO_EASE = "expo.out";
const HEADLINE_EASE = "power4.out";
const HIGHLIGHT_LINE_CLASS = "hero-line hero-line-highlight";
// Lets the headline land first. Starting the scene takes a few hundred milliseconds of
// main-thread work, which a moving headline would show and the static poster hides.
const SCENE_START_DELAY_MS = 900;

export default function Hero({ profile }: HeroProps) {
  const { name, university, badge, tagline, profileImage, stats } = profile;
  const { headlineLead, headlineHighlight } = profile;
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<HeroMotion>({ ...initialHeroMotion });
  const contextRef = useRef<gsap.Context | null>(null);
  const reducedMotionRef = useRef(false);
  const [sceneWanted, setSceneWanted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSceneWanted(true), SCENE_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pointerCleanups: (() => void)[] = [];
    const reducedMotion = prefersReducedMotion();
    reducedMotionRef.current = reducedMotion;

    // On a slow device the CSS fallback has already shown the hero by now, and replaying
    // the intro would make it vanish and come back. Read before getRevealStates() below,
    // which cancels that fallback.
    const headline = root.querySelector("h1");
    const headlineStyle = headline && getComputedStyle(headline);
    const introMissed = headlineStyle?.visibility === "visible" && Number(headlineStyle.opacity) > 0;

    const context = gsap.context(() => {
      const { from, to } = getRevealStates();

      gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((element) => {
        pointerCleanups.push(magneticEffect(element, { strength: 0.25 }));
      });

      if (introMissed) {
        gsap.set(".hero-reveal", { opacity: 1 });
      } else {
        gsap
          .timeline({ defaults: { duration: 0.9, ease: INTRO_EASE } })
          .fromTo('[data-hero="rise"]', from, { ...to, stagger: 0.08 }, 0.15)
          .fromTo('[data-hero="card"]', from, { ...to, stagger: 0.1 }, 0.5)
          .fromTo('[data-hero="cta"]', from, { ...to, stagger: 0.08 }, 0.8);

        if (reducedMotion) {
          gsap.to(headline, { opacity: 1, duration: 0.5 });
        } else {
          gsap.set(headline, { opacity: 1 });

          // Each line carries its own gradient, because a transformed line would drop out
          // of a parent's background-clip. autoSplit redoes the lines if the width or font
          // changes.
          gsap.utils.toArray<HTMLElement>("[data-hero-line]").forEach((line, index) => {
            SplitText.create(line, {
              type: "lines",
              mask: "lines",
              tag: "span",
              aria: "none", // whole words stay in place, so screen readers read straight through
              autoSplit: true,
              linesClass: line.dataset.heroLine === "highlight" ? HIGHLIGHT_LINE_CLASS : "hero-line",
              onSplit: (split) =>
                gsap.from(split.lines, {
                  yPercent: 115,
                  duration: 1.1,
                  delay: 0.05 + index * 0.14,
                  ease: HEADLINE_EASE,
                  stagger: 0.1,
                }),
            });
          });
        }
      }

      if (reducedMotion) return;

      gsap
        .timeline({
          defaults: { duration: 1, ease: "power2.out" },
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.7 },
        })
        .to(motionRef.current, { scroll: 1, ease: "power2.inOut" }, 0)
        .to('[data-parallax="near"]', { y: -130 }, 0)
        .to('[data-parallax="mid"]', { y: -75 }, 0)
        .to('[data-parallax="far"]', { y: -30 }, 0)
        .to('[data-hero="cue"]', { opacity: 0, duration: 0.2 }, 0)
        .to('[data-hero="content"]', { opacity: 0, duration: 0.6, ease: "power2.in" }, 0.15)
        // Done while the hero's lower edge is on screen, or that edge would still show.
        .to('[data-hero="fade"]', { opacity: 1, duration: 0.62, ease: "sine.inOut" }, 0.05);
    }, root);

    contextRef.current = context;

    const motion = motionRef.current;
    const followPointer = ({ clientX, clientY }: PointerEvent) => {
      motion.pointerX = (clientX / window.innerWidth) * 2 - 1;
      motion.pointerY = 1 - (clientY / window.innerHeight) * 2;
    };

    const tracksPointer =
      !reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (tracksPointer) window.addEventListener("pointermove", followPointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", followPointer);
      pointerCleanups.forEach((cleanup) => cleanup());
      context.revert();
      contextRef.current = null;
    };
  }, []);

  // The scene can land well after the text, so its entrance waits for its first frame
  // rather than sharing the intro timeline. The poster holds the spot until then.
  const handleSceneReady = useCallback(() => {
    contextRef.current?.add(() => {
      const reveal = { duration: reducedMotionRef.current ? 0 : 0.9, ease: INTRO_EASE };

      gsap.fromTo(
        stageRef.current,
        { opacity: 0, scale: reducedMotionRef.current ? 1 : 1.06 },
        { ...reveal, opacity: 1, scale: 1 },
      );
      gsap.to(posterRef.current, { ...reveal, opacity: 0 });
      gsap.to(motionRef.current, { ...reveal, enter: 1, duration: reveal.duration * 1.4 });
    });
  }, []);

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative flex min-h-svh flex-col overflow-hidden bg-navy-950 text-white"
    >
      {/* Stays behind the canvas, so it is also the fallback when there is no WebGL. */}
      <div aria-hidden="true" className="hero-backdrop absolute inset-0" />

      <div
        ref={stageRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-2 opacity-0"
      >
        {sceneWanted && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroScene
                motionRef={motionRef}
                stageRef={stageRef}
                anchorRef={anchorRef}
                onReady={handleSceneReady}
              />
            </Suspense>
          </SceneBoundary>
        )}
      </div>

      {/* Sits between the scene and the text, so no frame of the scene can cost contrast. */}
      <div aria-hidden="true" className="hero-scrim pointer-events-none absolute inset-0 z-3" />

      <div
        data-hero="content"
        className="page-container-wide grid flex-1 content-center items-center gap-x-10 gap-y-5 pb-14 pt-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:gap-y-8 lg:pb-6 lg:pt-20 xl:gap-x-16"
      >
        <div data-parallax="far" className="min-w-0 lg:self-end">
          <p data-hero="rise" className="hero-reveal">
            <span className="glass-chip inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
              {badge}
            </span>
          </p>

          <h1
            data-hero="headline"
            className="hero-reveal mt-5 font-display text-[clamp(2.75rem,min(6.2vw,10.5vh),5.75rem)] font-extrabold leading-[0.98] tracking-[-0.035em] lg:mt-7"
          >
            <span data-hero-line="lead" className="block">
              {headlineLead}
            </span>{" "}
            <span data-hero-line="highlight" className="hero-line-highlight block w-fit">
              {headlineHighlight}
            </span>
          </h1>

          <p data-hero="rise" className="hero-reveal mt-5 max-w-xl text-lg leading-8 text-navy-100 lg:mt-7">
            {tagline}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 lg:mt-8">
            <div data-hero="cta" className="hero-reveal">
              <a href="#research" data-magnetic className="glass-cta glass-cta-primary">
                Explore Research
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
            <div data-hero="cta" className="hero-reveal">
              <a href="#supervision" data-magnetic className="glass-cta">
                <Users aria-hidden="true" className="size-4" />
                Student Supervision
              </a>
            </div>
          </div>
        </div>

        {/* The crystal is drawn over this slot. Nothing here moves it, so it can be measured. */}
        <div
          ref={anchorRef}
          className="relative mx-auto aspect-square w-full max-w-[min(100%,18rem)] sm:max-w-sm lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-[min(100%,72svh)]"
        >
          <div ref={posterRef} aria-hidden="true" className="hero-poster absolute inset-[14%]" />

          <div data-parallax="near" className="absolute inset-x-[8%] -bottom-2 lg:bottom-2">
            <div data-hero="card" className="hero-reveal">
              <GlassCard className="flex items-center gap-3 px-4 py-3">
                <Avatar
                  name={name}
                  src={profileImage}
                  size={44}
                  className="bg-white/10 text-accent-200 ring-1 ring-white/20"
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold tracking-tight">{name}</p>
                  <p className="truncate text-sm text-navy-100">{university}</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        <div data-parallax="mid" className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
          <div data-hero="card" className="hero-reveal">
            <GlassCard>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4 sm:grid-cols-4">
                {stats.map(({ label, value, suffix }) => (
                  <div key={label} className="flex flex-col-reverse">
                    <dt className="mt-0.5 text-xs font-medium leading-snug text-navy-100">{label}</dt>
                    <dd className="font-display text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl">
                      {formatCount(value, suffix)}
                    </dd>
                  </div>
                ))}
              </dl>
            </GlassCard>
          </div>
        </div>
      </div>

      <div data-hero="cta" className="hero-reveal page-container-wide mb-6 hidden lg:block">
        <a
          href="#about"
          data-hero="cue"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-navy-100 transition-colors hover:text-white"
        >
          <ArrowDown aria-hidden="true" className="size-4 text-accent-400" />
          Scroll to explore
        </a>
      </div>

      {/* Rises with the scroll, so the dark hero melts into the light section after it. */}
      <div
        aria-hidden="true"
        data-hero="fade"
        className="hero-fade pointer-events-none absolute inset-x-0 bottom-0 z-20 h-3/5 opacity-0"
      />
    </section>
  );
}
