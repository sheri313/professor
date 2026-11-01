import { Briefcase, GitBranch, Globe, Mail, type LucideIcon } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { MemberRole, TeamMember } from "@/data/professorData";

interface TeamProps {
  members: TeamMember[];
}

interface MemberCardProps {
  member: TeamMember;
}

interface MemberLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const roleOrder: Record<MemberRole, number> = {
  "Research Scientist": 0,
  "Postdoctoral Researcher": 1,
  "PhD Student": 2,
  "MSc Student": 3,
  "Undergraduate Researcher": 4,
  Alumni: 5,
};

function getMemberLinks({ name, email, github, linkedin, personalSite }: TeamMember): MemberLink[] {
  const links: MemberLink[] = [{ label: `Email ${name}`, href: `mailto:${email}`, icon: Mail }];

  if (github) links.push({ label: `${name} on GitHub`, href: github, icon: GitBranch });
  if (linkedin) links.push({ label: `${name} on LinkedIn`, href: linkedin, icon: Briefcase });
  if (personalSite) links.push({ label: `${name}'s website`, href: personalSite, icon: Globe });

  return links;
}

function MemberCard({ member }: MemberCardProps) {
  const { name, role, photo, researchArea, bio } = member;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={photo} size={56} className="bg-navy-900 text-white" />
        <div>
          <h3 className="font-display font-bold text-navy-900">{name}</h3>
          <p className="text-sm font-medium text-accent-700">{role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-navy-800">{researchArea}</p>
      <p className="mt-2 flex-1 text-sm leading-6 text-navy-600">{bio}</p>
      <ul className="mt-4 flex gap-1 border-t border-navy-100 pt-3">
        {getMemberLinks(member).map(({ label, href, icon: Icon }) => {
          const external = href.startsWith("http");
          return (
            <li key={href}>
              <a
                href={href}
                aria-label={label}
                title={label}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="flex size-9 items-center justify-center rounded-md text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-900"
              >
                <Icon aria-hidden="true" className="size-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default function Team({ members }: TeamProps) {
  const current = members
    .filter(({ role }) => role !== "Alumni")
    .sort((a, b) => roleOrder[a.role] - roleOrder[b.role] || a.year - b.year);
  const alumni = members.filter(({ role }) => role === "Alumni");

  return (
    <section id="team" className="bg-navy-50 py-20 lg:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Team"
            title="Meet the lab"
            description="Researchers, students, and alumni working together across software engineering, reliability, and human-computer interaction."
          />
        </Reveal>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {current.map((member, index) => (
            <li key={member.id}>
              <Reveal delay={index * 0.05} className="h-full">
                <MemberCard member={member} />
              </Reveal>
            </li>
          ))}
        </ul>

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
