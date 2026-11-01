import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Mic,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { ProfessorProfile } from "@/data/professorData";

interface AboutProps {
  profile: ProfessorProfile;
}

interface CredentialsProps {
  title: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
}

interface QuickFact {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

function Credentials({ title, icon: Icon, className = "", children }: CredentialsProps) {
  return (
    <div className={className}>
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy-900">
        <Icon aria-hidden="true" className="size-4 text-accent-700" />
        {title}
      </h3>
      <ul className="mt-4 space-y-4">{children}</ul>
    </div>
  );
}

export default function About({ profile }: AboutProps) {
  const { bio, title, university, email, officeLocation, socials, cv } = profile;

  const facts: QuickFact[] = [
    { label: "Current Position", value: title, icon: BriefcaseBusiness },
    { label: "University", value: university, icon: Building2 },
    { label: "Email", value: email, icon: Mail, href: `mailto:${email}` },
    { label: "Office Location", value: officeLocation, icon: MapPin },
  ];

  return (
    <section id="about" className="bg-background py-20 lg:py-24">
      <div className="page-container grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading eyebrow="About" title="Biography" />
            <div className="mt-8 space-y-5 text-lg leading-8 text-navy-600">
              {bio.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-12 grid gap-10 border-t border-navy-100 pt-10 sm:grid-cols-2">
            <Credentials title="Academic background" icon={GraduationCap}>
              {profile.education.map(({ degree, institution, year }) => (
                <li key={degree}>
                  <p className="text-sm font-semibold text-navy-900">{degree}</p>
                  <p className="text-sm text-navy-600">
                    {institution}, {year}
                  </p>
                </li>
              ))}
            </Credentials>

            <Credentials title="Editorial boards" icon={BookOpen}>
              {profile.editorialBoards.map(({ role, venue, period }) => (
                <li key={venue}>
                  <p className="text-sm font-semibold text-navy-900">{role}</p>
                  <p className="text-sm text-navy-600">
                    {venue}, {period}
                  </p>
                </li>
              ))}
            </Credentials>

            <Credentials title="Keynote speeches" icon={Mic} className="sm:col-span-2">
              {profile.keynotes.map(({ title: talk, event, location, year }) => (
                <li key={talk} className="flex gap-4">
                  <span className="w-10 shrink-0 text-sm font-semibold tabular-nums text-accent-700">
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
            </Credentials>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
          <aside
            aria-label="Quick facts"
            className="rounded-2xl border border-navy-100 bg-navy-50 p-6 transition-shadow duration-200 hover:shadow-md"
          >
            <h3 className="font-display text-lg font-bold text-navy-900">Quick facts</h3>

            <dl className="mt-5 space-y-4">
              {facts.map(({ label, value, icon: Icon, href }) => (
                <div key={label} className="flex gap-3">
                  <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-700" />
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 wrap-break-word text-sm font-medium text-navy-900">
                      {href ? (
                        <a href={href} className="transition-colors hover:text-accent-700">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-2 border-t border-navy-200 pt-5">
              {socials
                .filter(({ featured }) => featured)
                .map(({ platform, url, icon: Icon }) => (
                  <li key={platform}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition-colors hover:border-accent-500 hover:text-accent-700"
                    >
                      <Icon aria-hidden="true" className="size-3.5" />
                      {platform}
                    </a>
                  </li>
                ))}
            </ul>

            {cv && (
              <a
                href={cv}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 transition-colors hover:text-accent-800"
              >
                <Download aria-hidden="true" className="size-4" />
                Download CV
              </a>
            )}
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
