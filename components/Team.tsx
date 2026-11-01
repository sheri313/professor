import { Briefcase, Globe, Mail, Megaphone, type LucideIcon } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { MemberRole, Recruitment, TeamMember } from "@/data/professorData";

interface TeamProps {
  members: TeamMember[];
  recruitment: Recruitment;
  contactEmail: string;
}

interface OpenPositionsBannerProps {
  recruitment: Recruitment;
  contactEmail: string;
}

interface MemberCardProps {
  member: TeamMember;
}

interface MemberGroup {
  role: Exclude<MemberRole, "Alumni">;
  title: string;
}

interface MemberLink {
  label: string;
  ariaLabel: string;
  href: string;
  icon: LucideIcon;
}

const memberGroups: MemberGroup[] = [
  { role: "PhD Candidate", title: "PhD Candidates" },
  { role: "Master's Student", title: "Master's Students" },
  { role: "Research Assistant", title: "Research Assistants" },
];

function getMemberLinks({ name, personalSite, linkedin }: TeamMember): MemberLink[] {
  const links: MemberLink[] = [];

  if (personalSite) {
    links.push({
      label: "Portfolio",
      ariaLabel: `${name}'s portfolio`,
      href: personalSite,
      icon: Globe,
    });
  }
  if (linkedin) {
    links.push({
      label: "LinkedIn",
      ariaLabel: `${name} on LinkedIn`,
      href: linkedin,
      icon: Briefcase,
    });
  }

  return links;
}

function OpenPositionsBanner({ recruitment, contactEmail }: OpenPositionsBannerProps) {
  const { eyebrow, title, description, audiences } = recruitment;

  return (
    <aside
      aria-labelledby="openings-title"
      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-accent-700 via-accent-800 to-navy-900 p-6 text-white shadow-xl shadow-accent-900/10 sm:p-10"
    >
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 size-72 rounded-full bg-accent-400/20 blur-3xl"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-200">
            <Megaphone aria-hidden="true" className="size-4" />
            {eyebrow}
          </p>
          <h2
            id="openings-title"
            className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-accent-50">{description}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {audiences.map((audience) => (
              <li
                key={audience}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium"
              >
                {audience}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={`mailto:${contactEmail}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-accent-100"
        >
          <Mail aria-hidden="true" className="size-4" />
          Send CV &amp; Transcripts
        </a>
      </div>
    </aside>
  );
}

function MemberCard({ member }: MemberCardProps) {
  const { name, photo, researchArea } = member;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 transition duration-200 hover:border-accent-200 hover:shadow-md">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={photo} size={64} className="bg-navy-900 text-white" />
        <div className="min-w-0">
          <h4 className="font-display font-bold text-navy-900">{name}</h4>
          <p className="mt-0.5 text-sm leading-5 text-navy-600">{researchArea}</p>
        </div>
      </div>

      <ul className="mt-auto flex gap-4 pt-4">
        {getMemberLinks(member).map(({ label, ariaLabel, href, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              aria-label={ariaLabel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 transition-colors hover:text-accent-800"
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

export default function Team({ members, recruitment, contactEmail }: TeamProps) {
  const alumni = members.filter(({ role }) => role === "Alumni");

  return (
    <section id="team" className="bg-navy-50 py-20 lg:py-24">
      <div className="page-container">
        {/* The hero CTA targets this wrapper. It sits outside Reveal so the
            reveal's translate can't throw off the anchor's scroll position. */}
        <div id="openings">
          <Reveal>
            <OpenPositionsBanner recruitment={recruitment} contactEmail={contactEmail} />
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <SectionHeading
            eyebrow="Team"
            title="Meet the lab"
            description="The students and researchers working across software engineering, distributed systems, and AI."
          />
        </Reveal>

        <div className="mt-10 space-y-12">
          {memberGroups.map(({ role, title }) => {
            const group = members
              .filter((member) => member.role === role)
              .sort((a, b) => a.year - b.year);

            if (group.length === 0) return null;

            return (
              <div key={role}>
                <h3 className="flex items-baseline gap-2 font-display text-xl font-bold text-navy-900">
                  {title}
                  <span className="text-sm font-medium text-navy-500">{group.length}</span>
                </h3>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((member, index) => (
                    <li key={member.id}>
                      <Reveal delay={index * 0.05} className="h-full">
                        <MemberCard member={member} />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {alumni.length > 0 && (
          <Reveal className="mt-14">
            <h3 className="font-display text-xl font-bold text-navy-900">Alumni</h3>
            <ul className="mt-4 divide-y divide-navy-200 border-y border-navy-200">
              {alumni.map(({ id, name, researchArea, graduated, currentPosition }) => (
                <li key={id} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
                  <p className="font-semibold text-navy-900">
                    {name}
                    <span className="ml-2 text-sm font-normal text-navy-500">
                      {researchArea}
                      {graduated && `, ${graduated}`}
                    </span>
                  </p>
                  {currentPosition && <p className="text-sm text-navy-600">{currentPosition}</p>}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
