"use client";

import gsap from "gsap";
import {
  ArrowRight,
  FileText,
  GraduationCap,
  Quote,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import type { HeroProfile, StatIconName } from "@/data/professorData";
import {
  SMOOTH_EASE,
  countUp,
  formatCount,
  getRevealStates,
  magneticEffect,
  prefersReducedMotion,
} from "@/utils/animations";

interface HeroProps {
  profile: HeroProfile;
}

const statIcons: Record<StatIconName, LucideIcon> = {
  citations: Quote,
  hIndex: TrendingUp,
  publications: FileText,
  graduates: GraduationCap,
};

export default function Hero({ profile }: HeroProps) {
  const { name, title, university, labRole, tagline, profileImage, stats } = profile;
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const magneticCleanups: (() => void)[] = [];

    const context = gsap.context(() => {
      const { from, to } = getRevealStates();
      const staggered = { ...to, stagger: 0.09 };
      const overlap = "-=0.65";

      const timeline = gsap
        .timeline({ defaults: { duration: 0.9, ease: SMOOTH_EASE } })
        .fromTo('[data-hero="badge"]', from, to)
        .fromTo('[data-hero="headline"]', from, to, overlap)
        .fromTo('[data-hero="text"]', from, staggered, overlap)
        .fromTo('[data-hero="portrait"]', from, to, "<")
        .addLabel("metrics", overlap)
        .fromTo('[data-hero="metric"]', from, staggered, "metrics")
        .fromTo('[data-hero="cta"]', from, staggered, overlap);

      if (!prefersReducedMotion()) {
        gsap.utils.toArray<HTMLElement>('[data-hero="count"]').forEach((element, index) => {
          const { value, suffix } = stats[index];
          timeline.add(countUp(element, value, { suffix }), "metrics");
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((element) => {
        magneticCleanups.push(magneticEffect(element, { strength: 0.25 }));
      });
    }, rootRef);

    return () => {
      magneticCleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [stats]);

  return (
    <section ref={rootRef} id="top" className="relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-blueprint mask-[radial-gradient(ellipse_at_top,black,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 size-128 rounded-full bg-accent-500/10 blur-3xl"
      />

      <div className="page-container pb-16 pt-28 lg:pb-20 lg:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_20rem] xl:gap-16">
          <div>
            <p
              data-hero="badge"
              className="gsap-reveal inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-400/10 px-3.5 py-1.5 text-sm font-medium text-accent-300"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
              {labRole}
            </p>

            <h1
              data-hero="headline"
              className="gsap-reveal mt-6 text-balance font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-[3.5rem]"
            >
              {profile.headlineLead}{" "}
              <span className="bg-linear-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
                {profile.headlineHighlight}
              </span>
            </h1>

            <p data-hero="text" className="gsap-reveal mt-6 max-w-2xl text-lg leading-8 text-navy-200">
              {tagline}
            </p>
            <p data-hero="text" className="gsap-reveal mt-4 text-sm text-navy-300">
              <span className="font-semibold text-white">{name}</span>, {title}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
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

          <div data-hero="portrait" className="gsap-reveal">
            <div className="mx-auto w-full max-w-xs rounded-3xl bg-linear-to-br from-accent-400/70 via-white/10 to-accent-600/50 p-0.5">
              <div className="relative flex aspect-4/5 items-center justify-center overflow-hidden rounded-[calc(1.5rem-2px)] bg-navy-900">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={`Portrait of ${name}`}
                    fill
                    preload
                    sizes="20rem"
                    className="object-cover"
                  />
                ) : (
                  <Avatar
                    name={name}
                    size={128}
                    className="mb-12 bg-navy-800 text-accent-300 ring-1 ring-white/10"
                  />
                )}
                <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-navy-950/70 p-3 text-center backdrop-blur">
                  <p className="font-display text-sm font-bold">{name}</p>
                  <p className="mt-0.5 text-xs text-navy-300">{university}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {stats.map(({ label, value, suffix, icon }) => {
            const Icon = statIcons[icon];
            return (
              <div key={label} data-hero="metric" className="gsap-reveal bg-navy-950 p-5 sm:p-6">
                <dt className="flex items-center gap-2 text-sm text-navy-300">
                  <Icon aria-hidden="true" className="size-4 text-accent-400" />
                  {label}
                </dt>
                <dd className="mt-2 font-display text-3xl font-bold tabular-nums sm:text-4xl">
                  <span data-hero="count">{formatCount(value, suffix)}</span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
