import {
  Activity,
  BookOpen,
  Building2,
  ExternalLink,
  FileText,
  FolderKanban,
  Link2,
  Mail,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import CountUp from "@/components/ui/CountUp";
import InkText from "@/components/ui/InkText";
import type { Profile, ProjectList, StatIconName } from "@/data/profile";

interface AboutProps {
  profile: Profile;
  projects: ProjectList;
}

type ChapterTone = "ink" | "mist";

interface ChapterProps {
  index: number;
  title: string;
  tone: ChapterTone;
  children: ReactNode;
}

const statIcons: Record<StatIconName, LucideIcon> = {
  outputs: FileText,
  projects: FolderKanban,
  articles: BookOpen,
  activeProjects: Activity,
};

const chapterTones: Record<ChapterTone, string> = {
  ink: "bg-navy-950 text-white",
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

export default function About({ profile, projects }: AboutProps) {
  const { bio, title, university, department, email, socials, stats } = profile;

  return (
    <section id="about" className="relative bg-navy-50 py-24 lg:py-32">
      <div className="page-container-wide">
        <h2 className="font-mono text-sm font-medium uppercase tracking-widest text-accent-700">
          Biography
        </h2>
        <InkText
          text={bio}
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
        <p className="mt-3 text-sm text-navy-500">
          Counts as listed on the Monash University research profile.
        </p>

        <div className="mt-16 space-y-5 lg:mt-20 lg:space-y-16">
          <Chapter index={1} title="Research projects" tone="ink">
            <ul className="divide-y divide-white/15">
              {projects.items.map(({ title: project, role, period, status }) => (
                <li key={project} className="py-4 first:pt-0">
                  <p className="text-lg font-semibold">{project}</p>
                  <p className="mt-1 text-sm text-navy-300">
                    {role}, {period}
                  </p>
                  <p className="mt-1 font-mono text-xs text-accent-300">{status}</p>
                </li>
              ))}
            </ul>
            <a
              href={projects.allProjectsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-300 transition-colors hover:text-accent-200"
            >
              View all {projects.total} projects
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          </Chapter>

          <Chapter index={2} title="Affiliation" tone="mist">
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest text-accent-800">
                  <Building2 aria-hidden="true" className="size-4" />
                  Institutional affiliation
                </h4>
                <p className="mt-4 font-display text-xl font-bold text-navy-900">{university}</p>
                <p className="mt-1 text-sm leading-6 text-navy-600">{department}</p>
                <p className="mt-3 text-sm font-medium text-navy-700">{title}</p>

                <a
                  href={`mailto:${email}`}
                  className="mt-5 inline-flex items-center gap-2 wrap-anywhere font-semibold text-accent-800 underline-offset-4 hover:underline"
                >
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  {email}
                </a>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-widest text-accent-800">
                  <Link2 aria-hidden="true" className="size-4" />
                  Academic profiles
                </h4>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {socials.map(({ platform, url, icon: Icon }) => (
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
                </ul>
              </div>
            </div>
          </Chapter>
        </div>
      </div>
    </section>
  );
}
