import { Mail, Megaphone } from "lucide-react";
import LabOrbit from "@/components/ui/LabOrbit";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Recruitment, TeamMember } from "@/data/professorData";

interface TeamProps {
  members: TeamMember[];
  recruitment: Recruitment;
  contactEmail: string;
  leadName: string;
  leadImage?: string;
}

interface OpenPositionsBannerProps {
  recruitment: Recruitment;
  contactEmail: string;
}

function OpenPositionsBanner({ recruitment, contactEmail }: OpenPositionsBannerProps) {
  const { eyebrow, title, description, audiences } = recruitment;

  return (
    <aside aria-labelledby="openings-title" className="portal relative z-20 text-white">
      <div aria-hidden="true" className="portal-glow" />

      <div className="relative overflow-hidden">
        <div className="page-container-wide grid gap-10 py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:py-28">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-widest text-accent-300">
              <Megaphone aria-hidden="true" className="size-4" />
              {eyebrow}
            </p>
            <h2
              id="openings-title"
              className="mt-4 font-display text-[clamp(3.25rem,10vw,8.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em]"
            >
              {title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-navy-100">{description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {audiences.map((audience) => (
                <li
                  key={audience}
                  className="rounded-full border border-white/25 bg-navy-950/40 px-3.5 py-1.5 text-sm font-medium"
                >
                  {audience}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* The ring lives here to stay centered on the button. Below lg the button sits
              under the text, where a ring this size would cut through it. */}
          <Reveal delay={0.15} className="relative w-fit lg:mr-24">
            <div
              aria-hidden="true"
              className="portal-ring absolute left-1/2 top-1/2 -z-10 hidden size-152 -translate-x-1/2 -translate-y-1/2 lg:block"
            />
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-navy-950 shadow-[0_0_48px_rgb(52_211_153/0.55)] transition-colors hover:bg-accent-100"
            >
              <Mail aria-hidden="true" className="size-5" />
              Send CV &amp; Transcripts
            </a>
          </Reveal>
        </div>
      </div>
    </aside>
  );
}

export default function Team({
  members,
  recruitment,
  contactEmail,
  leadName,
  leadImage,
}: TeamProps) {
  return (
    <section id="team" className="relative overflow-x-clip bg-accent-900">
      {/* The hero CTA targets this wrapper. It sits outside Reveal so the
          reveal's translate can't throw off the anchor's scroll position. */}
      <div id="openings">
        <OpenPositionsBanner recruitment={recruitment} contactEmail={contactEmail} />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(52rem_52rem_at_74%_62%,var(--color-accent-700),transparent_72%)]"
      />

      <LabOrbit members={members} leadName={leadName} leadImage={leadImage}>
        <Reveal>
          <SectionHeading
            eyebrow="Team"
            title="Meet the lab"
            description="The students and researchers working across software engineering, distributed systems, and AI."
            tone="dark"
          />
        </Reveal>
      </LabOrbit>
    </section>
  );
}
