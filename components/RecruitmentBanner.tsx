import { Check, Mail, Megaphone } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import type { Recruitment } from "@/data/professorData";

interface RecruitmentBannerProps {
  recruitment: Recruitment;
  email: string;
}

export default function RecruitmentBanner({ recruitment, email }: RecruitmentBannerProps) {
  const { eyebrow, title, description, positions } = recruitment;

  return (
    <section
      id="openings"
      aria-labelledby="openings-title"
      className="border-y border-accent-100 bg-accent-50 py-14 lg:py-16"
    >
      <Reveal className="page-container grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-800">
            <Megaphone aria-hidden="true" className="size-4" />
            {eyebrow}
          </p>
          <h2
            id="openings-title"
            className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900"
          >
            {title}
          </h2>
          <p className="mt-4 leading-7 text-navy-700">{description}</p>
          <a
            href={`mailto:${email}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-800"
          >
            <Mail aria-hidden="true" className="size-4" />
            Apply by email
          </a>
        </div>

        <ul className="space-y-3 self-center">
          {positions.map((position) => (
            <li
              key={position}
              className="flex gap-3 rounded-xl border border-accent-100 bg-white p-4 text-sm font-medium text-navy-800"
            >
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-700" />
              {position}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
