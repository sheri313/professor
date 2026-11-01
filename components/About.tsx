import {
  BookOpen,
  Building2,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Quote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import CountUp from "@/components/ui/CountUp";
import InkText from "@/components/ui/InkText";
import type { ProfessorProfile, StatIconName } from "@/data/professorData";

interface AboutProps {
  profile: ProfessorProfile;
}

type ChapterTone = "paper" | "ink" | "emerald" | "mist";

interface ChapterProps {
  index: number;
  title: string;
  tone: ChapterTone;
  children: ReactNode;
}

interface CredentialListProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

const statIcons: Record<StatIconName, LucideIcon> = {
  citations: Quote,
  hIndex: TrendingUp,
  publications: FileText,
  graduates: GraduationCap,
};

const chapterTones: Record<ChapterTone, string> = {
  paper: "border border-navy-200 bg-white text-navy-800",
  ink: "bg-navy-950 text-white",
  emerald: "bg-linear-to-br from-accent-700 to-accent-900 text-white",
  mist: "border border-accent-200 bg-accent-50 text-navy-800",
};

// Stacks by CSS alone: each chapter sticks a little lower than the last, so the ones
// beneath stay peeking out. Below lg a chapter can outgrow the screen, so they just flow.
function Chapter({ index, title, tone, children }: ChapterProps) {
  return (
    <article
      style={{ "--chapter": index } as CSSProperties}
      className={`rounded-3xl p-7 shadow-[0_-18px_50px_-30px_rgb(12_20_35/0.45)] sm:p-10 lg:sticky lg:top-[calc(5rem+var(--chapter)*1.25rem)] lg:min-h-96 ${chapterTones[tone]}`}
    >
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
        <header>
          <p className="font-mono text-xs tracking-widest opacity-70">
            {String(index).padStart(2, "0")}
          </p>
          <h3 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{title}</h3>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </article>
  );
}

function CredentialList({ title, icon: Icon, children }: CredentialListProps) {
  return (
    <div>
      <h4 className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest text-accent-300">
        <Icon aria-hidden="true" className="size-4" />
        {title}
      </h4>
      <ul className="mt-4 space-y-4">{children}</ul>
    </div>
  );
}

export default function About({ profile }: AboutProps) {
  const { bio, title, university, department, labRole, email, socials, cv, stats } = profile;
  const { officeHours, officeLocation, education, editorialBoards, keynotes } = profile;
  const [lead, ...story] = bio.split("\n\n");
  const links = socials.filter(({ featured }) => featured);

  return (
    <section id="about" className="relative bg-navy-50 py-24 lg:py-32">
      <div className="page-container-wide">
        <h2 className="font-mono text-sm font-medium uppercase tracking-widest text-accent-700">
          Biography
        </h2>
        <InkText
          text={lead}
          className="mt-6 max-w-6xl font-display text-[clamp(1.75rem,3.7vw,3.5rem)] font-bold leading-[1.16] tracking-tight text-navy-900"
        />

        <dl className="mt-20 grid grid-cols-2 border-y border-navy-200 lg:grid-cols-4">
          {stats.map(({ label, value, suffix, icon }) => {
            const Icon = statIcons[icon];
            return (
              <div
                key={label}
                className="border-navy-200 py-8 odd:pr-4 even:border-l even:pl-4 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0"
              >
                <dt className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-navy-500">
                  <Icon aria-hidden="true" className="size-4 text-accent-700" />
                  {label}
                </dt>
                <dd className="mt-3 font-display text-5xl font-extrabold tabular-nums tracking-tight text-navy-900 sm:text-7xl">
                  <CountUp value={value} suffix={suffix} />
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-16 space-y-5 lg:mt-20 lg:space-y-16">
          <Chapter index={1} title="The story" tone="paper">
            <div className="space-y-4 text-lg leading-8 text-navy-600 lg:columns-2 lg:gap-12 lg:space-y-0 lg:text-base lg:leading-7 lg:[&>p+p]:mt-4">
              {story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Chapter>

          <Chapter index={2} title="Credentials" tone="ink">
            <div className="grid gap-10 sm:grid-cols-2">
              <CredentialList title="Academic background" icon={GraduationCap}>
                {education.map(({ degree, institution, year }) => (
                  <li key={degree}>
                    <p className="font-semibold">{degree}</p>
                    <p className="text-sm text-navy-300">
                      {institution}, {year}
                    </p>
                  </li>
                ))}
              </CredentialList>
              <CredentialList title="Editorial boards" icon={BookOpen}>
                {editorialBoards.map(({ role, venue, period }) => (
                  <li key={venue}>
                    <p className="font-semibold">{role}</p>
                    <p className="text-sm text-navy-300">
                      {venue}, {period}
                    </p>
                  </li>
                ))}
              </CredentialList>
            </div>
          </Chapter>

          <Chapter index={3} title="On stage" tone="emerald">
            <ul className="divide-y divide-white/15">
              {keynotes.map(({ title: talk, event, location, year }) => (
                <li key={talk} className="grid gap-1 py-4 first:pt-0 sm:grid-cols-[6rem_minmax(0,1fr)]">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-accent-200">
                    {year}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{talk}</p>
                    <p className="text-sm text-accent-100">
                      {event}, {location}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Chapter>

          <Chapter index={4} title="Office & affiliation" tone="mist">
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest text-accent-800">
                  <Building2 aria-hidden="true" className="size-4" />
                  Institutional affiliation
                </h4>
                <p className="mt-4 font-display text-xl font-bold text-navy-900">{university}</p>
                <p className="mt-1 text-sm leading-6 text-navy-600">{department}</p>
                <p className="mt-3 text-sm font-medium text-navy-700">{title}</p>
                <p className="text-sm text-navy-600">{labRole}</p>

                <a
                  href={`mailto:${email}`}
                  className="mt-5 inline-flex items-center gap-2 wrap-anywhere font-semibold text-accent-800 underline-offset-4 hover:underline"
                >
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  {email}
                </a>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {links.map(({ platform, url, icon: Icon }) => (
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
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest text-accent-800">
                  <Clock aria-hidden="true" className="size-4" />
                  Office hours
                </h4>
                <dl className="mt-3 divide-y divide-accent-200">
                  {officeHours.map(({ day, time, format }) => (
                    <div key={day} className="flex flex-wrap justify-between gap-x-4 py-2.5">
                      <dt className="font-semibold text-navy-900">{day}</dt>
                      <dd className="text-sm text-navy-700 sm:text-right">
                        {time}
                        <span className="block text-xs text-navy-500">{format}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 font-mono text-xs text-accent-800">{officeLocation}</p>
              </div>
            </div>
          </Chapter>
        </div>
      </div>
    </section>
  );
}
