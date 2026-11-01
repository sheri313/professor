import {
  BookOpen,
  Building2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Mic,
  Quote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import BatchReveal from "@/components/ui/BatchReveal";
import CountUp from "@/components/ui/CountUp";
import TiltCard from "@/components/ui/TiltCard";
import type { ProfessorProfile, StatIconName } from "@/data/professorData";

interface AboutProps {
  profile: ProfessorProfile;
}

type CardTone = "paper" | "ink" | "emerald";
type SlideFrom = "left" | "right" | "up" | "down";

interface BentoCardProps {
  from: SlideFrom;
  span: string;
  tone?: CardTone;
  children: ReactNode;
}

interface CardTitleProps {
  title: string;
  icon: LucideIcon;
}

interface MetricLayout {
  from: SlideFrom;
  span: string;
  tone: CardTone;
  icon: LucideIcon;
  large?: boolean;
}

const cardTones: Record<CardTone, string> = {
  paper: "border border-navy-100 bg-white text-navy-800",
  ink: "bg-navy-950 text-white",
  emerald: "bg-linear-to-br from-accent-300 to-accent-500 text-navy-950",
};

const metricLayouts: Record<StatIconName, MetricLayout> = {
  citations: { from: "right", span: "col-span-2", tone: "ink", icon: Quote, large: true },
  hIndex: { from: "down", span: "col-span-1", tone: "emerald", icon: TrendingUp },
  publications: { from: "right", span: "col-span-1", tone: "paper", icon: FileText },
  graduates: { from: "up", span: "col-span-2 lg:col-span-1", tone: "paper", icon: GraduationCap },
};

function BentoCard({ from, span, tone = "paper", children }: BentoCardProps) {
  return (
    <div data-batch data-from={from} className={`gsap-reveal ${span}`}>
      <TiltCard tilt={false}>
        <article
          className={`relative flex h-full flex-col overflow-hidden rounded-3xl p-6 sm:p-7 ${cardTones[tone]}`}
        >
          {children}
        </article>
      </TiltCard>
    </div>
  );
}

function CardTitle({ title, icon: Icon }: CardTitleProps) {
  return (
    <h3 className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest opacity-70">
      <Icon aria-hidden="true" className="size-4" />
      {title}
    </h3>
  );
}

export default function About({ profile }: AboutProps) {
  const { bio, title, university, department, labRole, email, socials, cv, stats } = profile;
  const { officeHours, officeLocation, education, editorialBoards, keynotes } = profile;
  const [lead, background, ...restOfBio] = bio.split("\n\n");

  const metrics = (icons: StatIconName[]) =>
    stats
      .filter(({ icon }) => icons.includes(icon))
      .map(({ label, value, suffix, icon }) => {
        const { from, span, tone, icon: Icon, large } = metricLayouts[icon];
        return (
          <BentoCard key={label} from={from} span={span} tone={tone}>
            <CardTitle title={label} icon={Icon} />
            <p
              className={`mt-auto pt-6 font-display font-extrabold tabular-nums leading-none tracking-tight ${
                large ? "text-6xl sm:text-7xl" : "text-4xl sm:text-5xl"
              }`}
            >
              <CountUp value={value} suffix={suffix} />
            </p>
            {large && (
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 size-56 rounded-full bg-[radial-gradient(closest-side,rgb(16_185_129/0.45),transparent)]"
              />
            )}
          </BentoCard>
        );
      });

  return (
    <section id="about" className="overflow-x-clip bg-navy-50 py-20 lg:py-28">
      <BatchReveal
        className="page-container-wide grid grid-cols-2 gap-4 [--card-radius:var(--radius-3xl)] lg:grid-cols-6 lg:gap-5"
      >
        <BentoCard from="left" span="col-span-2 lg:col-span-4 lg:row-span-3">
          <p className="font-mono text-sm font-medium uppercase tracking-widest text-accent-700">
            About
          </p>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
            Biography
          </h2>
          <p className="mt-6 text-pretty font-display text-xl font-medium leading-8 text-navy-800 sm:text-2xl sm:leading-10">
            {lead}
          </p>
          <p className="mt-4 leading-7 text-navy-600">{background}</p>

          <details className="disclosure group mt-auto pt-6">
            <summary className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 transition-colors hover:text-accent-800">
              <span className="group-open:hidden">Read the full biography</span>
              <span className="hidden group-open:inline">Show less</span>
              <ChevronDown
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            <div className="space-y-4 pt-4 leading-7 text-navy-600">
              {restOfBio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>
        </BentoCard>

        {metrics(["citations", "hIndex", "publications"])}

        <BentoCard from="right" span="col-span-2">
          <CardTitle title="Institutional affiliation" icon={Building2} />
          <p className="mt-4 font-display text-xl font-bold tracking-tight text-navy-900">
            {university}
          </p>
          <p className="mt-1 text-sm leading-6 text-navy-600">{department}</p>
          <p className="mt-3 text-sm font-medium text-navy-700">{title}</p>
          <p className="text-sm text-navy-600">{labRole}</p>
        </BentoCard>

        <BentoCard from="left" span="col-span-2 lg:row-span-2" tone="ink">
          <CardTitle title="Office hours" icon={Clock} />
          <dl className="mt-4 divide-y divide-white/10">
            {officeHours.map(({ day, time, format }) => (
              <div key={day} className="py-3">
                <dt className="font-display font-bold">{day}</dt>
                <dd className="text-sm text-navy-200">
                  {time}
                  <span className="block text-xs text-navy-300">{format}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-auto pt-3 font-mono text-xs text-accent-300">{officeLocation}</p>
        </BentoCard>

        <BentoCard from="up" span="col-span-2 sm:col-span-1 lg:col-span-2 lg:row-span-2">
          <CardTitle title="Academic background" icon={GraduationCap} />
          <ul className="mt-4 flex flex-1 flex-col justify-between gap-4">
            {education.map(({ degree, institution, year }) => (
              <li key={degree}>
                <p className="text-sm font-semibold text-navy-900">{degree}</p>
                <p className="text-sm text-navy-600">
                  {institution}, {year}
                </p>
              </li>
            ))}
          </ul>
        </BentoCard>

        <BentoCard from="right" span="col-span-2 sm:col-span-1 lg:col-span-2 lg:row-span-2">
          <CardTitle title="Editorial boards" icon={BookOpen} />
          <ul className="mt-4 flex flex-1 flex-col justify-between gap-4">
            {editorialBoards.map(({ role, venue, period }) => (
              <li key={venue}>
                <p className="text-sm font-semibold text-navy-900">{role}</p>
                <p className="text-sm text-navy-600">
                  {venue}, {period}
                </p>
              </li>
            ))}
          </ul>
        </BentoCard>

        <BentoCard from="left" span="col-span-2 lg:col-span-3">
          <CardTitle title="Keynote speeches" icon={Mic} />
          <ul className="mt-4 space-y-4">
            {keynotes.map(({ title: talk, event, location, year }) => (
              <li key={talk} className="flex gap-4">
                <span className="w-10 shrink-0 font-mono text-sm font-medium text-accent-700">
                  {year}
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{talk}</p>
                  <p className="text-sm text-navy-600">
                    {event}, {location}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </BentoCard>

        {metrics(["graduates"])}

        <BentoCard from="right" span="col-span-2" tone="emerald">
          <CardTitle title="Connect" icon={Mail} />
          <a
            href={`mailto:${email}`}
            className="mt-4 wrap-anywhere font-display text-lg font-bold underline-offset-4 hover:underline"
          >
            {email}
          </a>
          <ul className="mt-auto flex flex-wrap gap-2 pt-5">
            {socials
              .filter(({ featured }) => featured)
              .map(({ platform, url, icon: Icon }) => (
                <li key={platform}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-800"
                  >
                    <Icon aria-hidden="true" className="size-3.5" />
                    {platform}
                  </a>
                </li>
              ))}
            {cv && (
              <li>
                <a
                  href={cv}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-800"
                >
                  <Download aria-hidden="true" className="size-3.5" />
                  Download CV
                </a>
              </li>
            )}
          </ul>
        </BentoCard>
      </BatchReveal>
    </section>
  );
}
