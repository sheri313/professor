import { ExternalLink, GraduationCap } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import type { Supervision as SupervisionDetails } from "@/data/profile";

interface SupervisionProps {
  supervision: SupervisionDetails;
}

export default function Supervision({ supervision }: SupervisionProps) {
  const { status, statement, levels, phdProjectsUrl } = supervision;

  return (
    <section
      id="supervision"
      aria-labelledby="supervision-title"
      className="portal relative z-20 overflow-x-clip text-white"
    >
      <div aria-hidden="true" className="portal-glow" />

      <div className="relative overflow-hidden">
        <div className="page-container-wide grid gap-10 py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:py-28">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-widest text-accent-300">
              <GraduationCap aria-hidden="true" className="size-4" />
              {status}
            </p>
            <h2
              id="supervision-title"
              className="mt-4 font-display text-[clamp(3.25rem,10vw,8.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em]"
            >
              Supervision
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-navy-100">{statement}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {levels.map((level) => (
                <li
                  key={level}
                  className="rounded-full border border-white/25 bg-navy-950/40 px-3.5 py-1.5 text-sm font-medium"
                >
                  {level}
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
              href={phdProjectsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-navy-950 shadow-[0_0_48px_rgb(52_211_153/0.55)] transition-colors hover:bg-accent-100"
            >
              PhD projects
              <ExternalLink aria-hidden="true" className="size-5" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
