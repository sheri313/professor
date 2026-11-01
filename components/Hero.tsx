"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Users } from "lucide-react";
import Image from "next/image";
import { Fragment, useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Avatar from "@/components/ui/Avatar";
import type { HeroProfile, Stat } from "@/data/professorData";
import {
  SMOOTH_EASE,
  cardPointerEffect,
  formatCount,
  getRevealStates,
  magneticEffect,
  prefersReducedMotion,
} from "@/utils/animations";
import { springEase } from "@/utils/sectionMotion";

interface HeroProps {
  profile: HeroProfile;
}

interface HeadlineWordsProps {
  text: string;
  firstIndex: number;
  highlight?: boolean;
}

interface DepthChipProps {
  stat: Stat;
  className: string;
}

function HeadlineWords({ text, firstIndex, highlight = false }: HeadlineWordsProps) {
  const highlightClassName =
    "-mb-[0.14em] bg-linear-to-br from-accent-200 to-accent-500 bg-clip-text pb-[0.14em] text-transparent";

  return text.split(" ").map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      <span
        style={{ "--word": firstIndex + index } as CSSProperties}
        className={`hero-word inline-block ${highlight ? highlightClassName : ""}`}
      >
        {word}
      </span>{" "}
    </Fragment>
  ));
}

// A separate layer for each job, because GSAP owns one transform per element:
// the wrapper sets the depth, data-hero="chip" enters, and data-hero="drift" idles.
function DepthChip({ stat: { label, value, suffix }, className }: DepthChipProps) {
  return (
    <div className={`absolute ${className}`}>
      <div data-hero="chip" className="gsap-reveal">
        <div
          data-hero="drift"
          className="rounded-2xl border border-white/15 bg-navy-900/85 px-4 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md"
        >
          <p className="font-display text-2xl font-extrabold tabular-nums tracking-tight">
            {formatCount(value, suffix)}
          </p>
          <p className="text-xs font-medium text-navy-300">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ profile }: HeroProps) {
  const { name, title, university, labRole, tagline, profileImage, stats } = profile;
  const { headlineLead, headlineHighlight } = profile;
  const [firstStat, secondStat] = stats;
  const rootRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const portrait = portraitRef.current;
    if (!root || !portrait) return;

    const pointerCleanups: (() => void)[] = [];

    const context = gsap.context(() => {
      const reducedMotion = prefersReducedMotion();
      const { from, to } = getRevealStates();

      gsap
        .timeline({ defaults: { duration: 0.9, ease: SMOOTH_EASE } })
        .fromTo('[data-hero="cta"]', from, { ...to, stagger: 0.09 }, 0.55)
        .fromTo(
          '[data-hero="chip"]',
          { ...from, scale: reducedMotion ? 1 : 0.7 },
          { ...to, scale: 1, duration: 1.2, ease: springEase(), stagger: 0.16 },
          0.75,
        );

      gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((element) => {
        pointerCleanups.push(magneticEffect(element, { strength: 0.25 }));
      });

      // The whole hero is the hit area, so the portrait answers the pointer from anywhere.
      pointerCleanups.push(
        cardPointerEffect(root, portrait, { maxTilt: 9, perspective: 1100, duration: 0.9 }),
      );

      if (reducedMotion) return;

      const idle = gsap
        .timeline({ defaults: { ease: "sine.inOut", yoyo: true, repeat: -1 } })
        .to('[data-hero="float"]', { y: -16, rotation: 0.8, duration: 3.6 }, 0)
        .to('[data-hero="drift"]', { y: 10, duration: 2.8, stagger: 0.7 }, 0);

      // Nothing on the rest of the page should pay for a loop nobody can see.
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => idle.paused(!isActive),
      });

      gsap.to('[data-hero="parallax"]', {
        y: 90,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);

    return () => {
      pointerCleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative flex min-h-svh flex-col overflow-hidden bg-navy-950 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-blueprint mask-[radial-gradient(ellipse_at_30%_20%,black,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="aurora -right-32 -top-40 size-176 [--aurora-color:rgb(16_185_129/0.3)] [--aurora-x:-6rem]"
      />
      <div
        aria-hidden="true"
        className="aurora -bottom-56 -left-40 size-152 [--aurora-color:rgb(45_212_191/0.16)] [--aurora-y:-5rem]"
      />

      <div className="page-container-wide grid flex-1 items-center gap-16 pb-20 pt-28 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 lg:pb-10 lg:pt-20 xl:gap-20">
        <div>
          {/* CSS animates this text so it paints without waiting for JavaScript. */}
          <p className="hero-rise">
            <span className="badge-float inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-400/10 px-3.5 py-1.5 text-sm font-medium text-accent-300">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
              {labRole}
            </span>
          </p>

          <h1 className="mt-7 font-display text-[clamp(2.75rem,min(6.2vw,10.5vh),5.75rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
            <HeadlineWords text={headlineLead} firstIndex={0} />
            <HeadlineWords
              text={headlineHighlight}
              firstIndex={headlineLead.split(" ").length}
              highlight
            />
          </h1>

          <p className="hero-rise mt-8 max-w-xl text-lg leading-8 text-navy-200 [animation-delay:420ms]">
            {tagline}
          </p>
          <p className="hero-rise mt-3 text-sm text-navy-300 [animation-delay:500ms]">
            <span className="font-semibold text-white">{name}</span>, {title}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <div data-hero="cta" className="gsap-reveal">
              <a
                href="#research"
                data-magnetic
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-accent-400"
              >
                Explore Research
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
            <div data-hero="cta" className="gsap-reveal">
              <a
                href="#openings"
                data-magnetic
                className="inline-flex items-center gap-2 rounded-lg border border-navy-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-accent-400 hover:text-accent-300"
              >
                <Users aria-hidden="true" className="size-4" />
                Openings for CSC &amp; Grad Students
              </a>
            </div>
          </div>
        </div>

        {/* Glides without fading, because the portrait can be the largest paint too. */}
        <div className="hero-glide mx-auto w-full max-w-72 sm:max-w-sm lg:max-w-[min(26rem,58svh)]">
          <div data-hero="parallax">
            <div data-hero="float">
              <div ref={portraitRef} className="relative transform-3d">
                <div
                  aria-hidden="true"
                  className="absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,rgb(16_185_129/0.32),transparent)]"
                />

                <div className="glass-frame relative rounded-4xl p-2.5">
                  <div className="relative flex aspect-4/5 items-center justify-center overflow-hidden rounded-3xl bg-navy-900">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt={`Portrait of ${name}`}
                        fill
                        preload
                        sizes="(min-width: 1024px) 26rem, (min-width: 640px) 24rem, 18rem"
                        className="object-cover object-top"
                      />
                    ) : (
                      <Avatar
                        name={name}
                        size={128}
                        className="mb-12 bg-navy-800 text-accent-300 ring-1 ring-white/10"
                      />
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-navy-950/30"
                    />
                  </div>
                </div>

                <div className="absolute inset-x-6 -bottom-5 rounded-2xl border border-white/15 bg-navy-950/80 px-4 py-3 text-center shadow-xl shadow-black/40 backdrop-blur-md transform-[translateZ(40px)]">
                  <p className="font-display text-sm font-bold">{name}</p>
                  <p className="mt-0.5 text-xs text-navy-300">{university}</p>
                </div>

                {firstStat && (
                  <DepthChip
                    stat={firstStat}
                    className="-left-6 top-10 transform-[translateZ(80px)] sm:-left-14"
                  />
                )}
                {secondStat && (
                  <DepthChip
                    stat={secondStat}
                    className="-right-6 top-[44%] transform-[translateZ(60px)] sm:-right-10"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="hero-rise page-container-wide mb-6 hidden items-center gap-2 text-xs font-medium uppercase tracking-widest text-navy-300 transition-colors [animation-delay:900ms] hover:text-white lg:flex"
      >
        <ArrowDown aria-hidden="true" className="size-4 text-accent-400" />
        Scroll to explore
      </a>
    </section>
  );
}
