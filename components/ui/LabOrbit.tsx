"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  GitBranch,
  Globe,
  Mail,
  Pause,
  Play,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { getInitials } from "@/components/ui/Avatar";
import type { MemberRole, TeamMember } from "@/data/professorData";
import {
  SMOOTH_EASE,
  cardPointerEffect,
  getRevealStates,
  prefersReducedMotion,
} from "@/utils/animations";
import { springEase } from "@/utils/sectionMotion";

interface LabOrbitProps {
  children: ReactNode;
  members: TeamMember[];
  leadName: string;
  leadImage?: string;
}

interface OrbitRing {
  role: MemberRole;
  title: string;
  diameter: number; // percent of the stage
  seconds: number; // for one revolution
  reverse?: boolean;
  lineClassName: string;
  nodeClassName: string;
}

interface OrbitNodeProps {
  member: TeamMember;
  angle: number;
  active: boolean;
  nodeClassName: string;
  onSelect: (id: string) => void;
}

interface MemberPanelProps {
  member: TeamMember;
  active: boolean;
}

interface MemberLink {
  label: string;
  ariaLabel: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

const CYCLE_INTERVAL_MS = 5000;
// Staggers each ring's starting angle, so their nodes don't all line up.
const RING_ANGLE_OFFSET = 37;
const NUCLEUS_DIAMETER = 20; // percent of the stage

const orbitRings: OrbitRing[] = [
  {
    role: "PhD Candidate",
    title: "PhD Candidates",
    diameter: 72,
    seconds: 150,
    lineClassName: "border-solid",
    nodeClassName: "bg-white text-accent-900",
  },
  {
    role: "Master's Student",
    title: "Master's Students",
    diameter: 36,
    seconds: 80,
    lineClassName: "border-solid",
    nodeClassName: "bg-accent-300 text-accent-900",
  },
  {
    role: "Research Assistant",
    title: "Research Assistants",
    diameter: 54,
    seconds: 110,
    reverse: true,
    lineClassName: "border-solid",
    nodeClassName: "bg-amber-200 text-amber-950",
  },
  {
    role: "Alumni",
    title: "Alumni",
    diameter: 90,
    seconds: 220,
    reverse: true,
    lineClassName: "border-dashed",
    nodeClassName: "border border-white/70 bg-accent-900 text-white",
  },
];

function getRingInset(diameter: number): string {
  return `${(100 - diameter) / 2}%`;
}

// How far a node's line reaches down its ring: to the edge of the portrait, not across it.
function getSpokeLength(diameter: number): string {
  return `${((diameter - NUCLEUS_DIAMETER) / 2 / diameter) * 100}%`;
}

function getMemberLinks({ name, personalSite, linkedin, github, email }: TeamMember): MemberLink[] {
  const links: MemberLink[] = [];

  if (personalSite) {
    links.push({
      label: "Portfolio",
      ariaLabel: `${name}'s portfolio`,
      href: personalSite,
      icon: Globe,
      external: true,
    });
  }
  if (linkedin) {
    links.push({
      label: "LinkedIn",
      ariaLabel: `${name} on LinkedIn`,
      href: linkedin,
      icon: Briefcase,
      external: true,
    });
  }
  if (github) {
    links.push({
      label: "GitHub",
      ariaLabel: `${name} on GitHub`,
      href: github,
      icon: GitBranch,
      external: true,
    });
  }
  links.push({ label: "Email", ariaLabel: `Email ${name}`, href: `mailto:${email}`, icon: Mail });

  return links;
}

function OrbitNode({ member, angle, active, nodeClassName, onSelect }: OrbitNodeProps) {
  const { id, name, role, photo } = member;

  return (
    <li className="orbit-arm" style={{ "--orbit-angle": `${angle}deg` } as CSSProperties}>
      {/* Rides inside the spinning ring, so it tracks its node with no JavaScript. */}
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-0 h-(--orbit-spoke) w-px origin-top bg-linear-to-b from-white to-white/10 transition-transform duration-500 ${
          active ? "scale-y-100" : "scale-y-0"
        }`}
      />

      <div className="orbit-anchor">
        <div className="orbit-counter size-full">
          <div data-orbit-node className="gsap-reveal relative size-full">
            <button
              type="button"
              aria-label={`${name}, ${role}`}
              aria-pressed={active}
              onClick={() => onSelect(id)}
              onFocus={() => onSelect(id)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") onSelect(id);
              }}
              className={`pointer-events-auto relative flex size-full items-center justify-center overflow-hidden rounded-full font-display text-[max(0.75rem,2.2cqw)] font-bold transition-[scale,box-shadow] duration-300 ${nodeClassName} ${
                active ? "scale-125 shadow-[0_0_0_3px_white,0_0_36px_6px_var(--color-accent-300)]" : "hover:scale-110"
              }`}
            >
              {photo ? (
                <Image src={photo} alt="" fill sizes="5rem" className="object-cover" />
              ) : (
                getInitials(name)
              )}
            </button>
            <span
              aria-hidden="true"
              className={`absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[max(0.6875rem,1.5cqw)] font-semibold transition-colors duration-300 @lg:block ${
                active ? "bg-white text-accent-900" : "bg-accent-900/80 text-white"
              }`}
            >
              {name}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

// Every panel is always in the document, stacked in one grid cell. The tallest sets
// the height, so nothing below jumps when the selection changes, and bios stay
// available to search engines and to visitors without JavaScript.
function MemberPanel({ member, active }: MemberPanelProps) {
  const { name, role, year, graduated, currentPosition, researchArea, bio } = member;

  return (
    <article
      className={`member-panel col-start-1 row-start-1 transition-[opacity,translate,visibility] duration-500 ease-out ${
        active ? "" : "invisible translate-y-3 opacity-0"
      }`}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-accent-200">
        {role} / {graduated ? `Class of ${graduated}` : `Since ${year}`}
      </p>
      <h3 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {name}
      </h3>
      <p className="mt-2 font-medium text-accent-200">{researchArea}</p>
      {currentPosition && <p className="mt-1 text-sm text-accent-100">{currentPosition}</p>}
      <p className="mt-4 leading-7 text-accent-50">{bio}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {getMemberLinks(member).map(({ label, ariaLabel, href, icon: Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              aria-label={ariaLabel}
              {...(external && { target: "_blank", rel: "noopener noreferrer" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-accent-900"
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function LabOrbit({ children, members, leadName, leadImage }: LabOrbitProps) {
  const rings = useMemo(
    () =>
      orbitRings
        .map((ring) => ({
          ...ring,
          members: members
            .filter(({ role }) => role === ring.role)
            .sort((a, b) => a.year - b.year),
        }))
        .filter((ring) => ring.members.length > 0),
    [members],
  );
  const roster = useMemo(() => rings.flatMap((ring) => ring.members), [rings]);

  const [activeId, setActiveId] = useState(roster[0]?.id);
  const [motionPaused, setMotionPaused] = useState(false);
  // Auto-advance ends at the first choice a visitor makes, so it can't move the
  // panel out from under someone who's reading it.
  const [cycling, setCycling] = useState(true);
  const [inView, setInView] = useState(false);

  const hitAreaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const activeIndex = Math.max(
    roster.findIndex(({ id }) => id === activeId),
    0,
  );
  const activeMember = roster[activeIndex];
  const MotionIcon = motionPaused ? Play : Pause;

  const select = (id: string) => {
    setActiveId(id);
    setCycling(false);
  };

  const step = (direction: number) => {
    select(roster[(activeIndex + direction + roster.length) % roster.length].id);
  };

  const toggleMotion = () => {
    setMotionPaused((paused) => !paused);
    setCycling(true);
  };

  useEffect(() => {
    const hitArea = hitAreaRef.current;
    const stage = stageRef.current;
    if (!hitArea || !stage) return;

    const stopTilt = cardPointerEffect(hitArea, stage, {
      maxTilt: 6,
      perspective: 1400,
      duration: 0.9,
    });

    const context = gsap.context(() => {
      const reducedMotion = prefersReducedMotion();
      const { to } = getRevealStates();

      // Paused rather than attached to the trigger, which would measure every node.
      const entrance = gsap
        .timeline({ paused: true })
        .fromTo(
          "[data-orbit-nucleus]",
          { opacity: 0, scale: reducedMotion ? 1 : 0.5 },
          { ...to, scale: 1, duration: 1.2, ease: springEase() },
        )
        .fromTo(
          "[data-orbit-ring]",
          { opacity: 0, scale: reducedMotion ? 1 : 0.82 },
          { ...to, scale: 1, duration: 1, ease: SMOOTH_EASE, stagger: 0.1 },
          0.1,
        )
        .fromTo(
          "[data-orbit-node]",
          { opacity: 0, scale: reducedMotion ? 1 : 0 },
          { ...to, scale: 1, duration: 1, ease: springEase(), stagger: 0.06 },
          0.35,
        );

      ScrollTrigger.create({
        trigger: stage,
        start: "top 75%",
        end: "max",
        onEnter: (self) => {
          self.kill();
          entrance.play();
        },
      });

      ScrollTrigger.create({
        trigger: stage,
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => setInView(isActive),
      });
    }, stage);

    return () => {
      stopTilt();
      context.revert();
    };
  }, []);

  useEffect(() => {
    if (motionPaused || !cycling || !inView || prefersReducedMotion()) return;

    const timer = setInterval(() => {
      setActiveId((current) => {
        const index = roster.findIndex(({ id }) => id === current);
        return roster[(index + 1) % roster.length].id;
      });
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [motionPaused, cycling, inView, roster]);

  if (!activeMember) return null;

  return (
    <div className="page-container-wide grid gap-10 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:py-24">
      <div>{children}</div>

      {/* The outer element stays still as the hit area, the same as TiltCard. */}
      <div ref={hitAreaRef} className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <div
          ref={stageRef}
          data-paused={motionPaused || !inView || undefined}
          className="orbit-stage @container relative mx-auto aspect-square w-full max-w-[min(100%,84svh)]"
        >
          {rings.map(({ role, diameter, lineClassName }) => (
            <div
              key={role}
              aria-hidden="true"
              data-orbit-ring
              style={{ inset: getRingInset(diameter) }}
              className={`gsap-reveal absolute rounded-full border border-white/20 ${lineClassName}`}
            />
          ))}

          <svg
            aria-hidden="true"
            data-orbit-ring
            viewBox="0 0 1000 1000"
            className="gsap-reveal pointer-events-none absolute inset-0 hidden size-full overflow-visible @lg:block"
          >
            {rings.map(({ role, title, diameter }, index) => {
              const radius = diameter * 5;
              return (
                <Fragment key={role}>
                  <path
                    id={`orbit-arc-${index}`}
                    fill="none"
                    d={`M${500 - radius} 500A${radius} ${radius} 0 0 1 ${500 + radius} 500`}
                  />
                  <text
                    dy={-8}
                    className="fill-accent-200 font-mono text-[14px] uppercase tracking-[0.22em]"
                  >
                    <textPath href={`#orbit-arc-${index}`} startOffset="50%" textAnchor="middle">
                      {title}
                    </textPath>
                  </text>
                </Fragment>
              );
            })}
          </svg>

          <div
            data-orbit-nucleus
            style={{ inset: getRingInset(NUCLEUS_DIAMETER) }}
            className="gsap-reveal absolute z-10"
          >
            <div className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-accent-800 font-display font-bold text-white shadow-[0_0_0_4px_rgb(255_255_255/0.2),0_0_70px_10px_rgb(52_211_153/0.45)]">
              {leadImage ? (
                <Image
                  src={leadImage}
                  alt={`Portrait of ${leadName}`}
                  fill
                  sizes="(min-width: 1024px) 9rem, 5rem"
                  className="object-cover object-top"
                />
              ) : (
                getInitials(leadName)
              )}
            </div>
            <p className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-[max(0.6875rem,1.5cqw)] font-bold text-accent-900 @lg:block">
              {leadName}
            </p>
          </div>

          {rings.map(
            ({ role, title, diameter, seconds, reverse, nodeClassName, members: ringMembers }, ringIndex) => (
              <ul
                key={role}
                aria-label={title}
                className="orbit-spin"
                style={
                  {
                    inset: getRingInset(diameter),
                    // Rings cross as they turn, and the selected member stays in front.
                    zIndex: ringMembers.includes(activeMember) ? 20 : undefined,
                    "--orbit-spoke": getSpokeLength(diameter),
                    "--orbit-seconds": `${seconds}s`,
                    "--orbit-direction": reverse ? "reverse" : "normal",
                    "--orbit-counter-direction": reverse ? "normal" : "reverse",
                  } as CSSProperties
                }
              >
                {ringMembers.map((member, index) => (
                  <OrbitNode
                    key={member.id}
                    member={member}
                    angle={(360 / ringMembers.length) * index + ringIndex * RING_ANGLE_OFFSET}
                    active={member.id === activeMember.id}
                    nodeClassName={nodeClassName}
                    onSelect={select}
                  />
                ))}
              </ul>
            ),
          )}
        </div>
      </div>

      <div className="lg:col-start-1 lg:row-start-2">
        {/* Announces choices but stays quiet during auto-advance, which would talk over everything. */}
        <p aria-live="polite" className="sr-only">
          {cycling ? "" : `${activeMember.name}, ${activeMember.role}`}
        </p>

        <div className="grid">
          {roster.map((member) => (
            <MemberPanel key={member.id} member={member} active={member.id === activeMember.id} />
          ))}
        </div>

        <div className="mt-7 flex items-center gap-2 border-t border-white/15 pt-5 font-mono text-xs text-accent-100">
          <button
            type="button"
            aria-label="Previous lab member"
            onClick={() => step(-1)}
            className="rounded-full border border-white/25 p-2 text-white transition-colors hover:bg-white hover:text-accent-900"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next lab member"
            onClick={() => step(1)}
            className="rounded-full border border-white/25 p-2 text-white transition-colors hover:bg-white hover:text-accent-900"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
          <span className="ml-2">
            {String(activeIndex + 1).padStart(2, "0")} / {String(roster.length).padStart(2, "0")}
          </span>

          <button
            type="button"
            onClick={toggleMotion}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-white motion-reduce:hidden"
          >
            <MotionIcon aria-hidden="true" className="size-3.5" />
            {motionPaused ? "Resume orbit" : "Pause orbit"}
          </button>
        </div>
      </div>
    </div>
  );
}
