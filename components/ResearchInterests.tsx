import { Tags } from "lucide-react";
import HorizontalTrack from "@/components/ui/HorizontalTrack";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import type { ResearchInterest } from "@/data/profile";

interface ResearchInterestsProps {
  interests: ResearchInterest[];
  keywords: string[];
}

const cardClassName =
  "group flex min-h-92 flex-col rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl shadow-black/40";
const iconClassName =
  "clip-hexagon flex size-14 items-center justify-center bg-linear-to-br from-accent-300 to-accent-600 text-navy-950 transition-transform duration-300 group-hover:rotate-6";

export default function ResearchInterests({ interests, keywords }: ResearchInterestsProps) {
  const cardCount = interests.length + 1;

  return (
    // The negative margin cancels the page's scroll padding, so a link to this section
    // lands where the stage engages instead of just above it.
    <section id="research" className="relative -scroll-mt-20 bg-navy-950 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-blueprint mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      />

      <HorizontalTrack label="Research interests" ghostText="Research" cardCount={cardCount}>
        <div data-stop className="w-(--track-intro) shrink-0 snap-center">
          <Reveal>
            <SectionHeading
              eyebrow="Research"
              title="Research interests"
              description="As stated on the Monash University research profile."
              tone="dark"
            />
            <p className="mt-6 font-mono text-xs text-accent-300">
              <span className="lg:hidden">Swipe through the research interests</span>
              <span className="hidden lg:inline">Keep scrolling through the research interests</span>
            </p>
          </Reveal>
        </div>

        <ol className="flex items-center gap-(--track-gap)">
          {interests.map(({ id, text, icon: Icon }, index) => (
            <li
              key={id}
              data-stop
              className={`w-(--track-card) shrink-0 snap-center ${
                index % 2 === 0 ? "lg:mb-28" : "lg:mt-28"
              }`}
            >
              <TiltCard>
                <article className={cardClassName}>
                  <div className="flex items-start justify-between">
                    <span className={iconClassName}>
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <span aria-hidden="true" className="font-mono text-xs text-navy-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 text-pretty font-display text-2xl font-bold leading-snug tracking-tight">
                    {text}
                  </h3>
                </article>
              </TiltCard>
            </li>
          ))}

          <li
            data-stop
            className={`w-(--track-card) shrink-0 snap-center ${
              interests.length % 2 === 0 ? "lg:mb-28" : "lg:mt-28"
            }`}
          >
            <TiltCard>
              <article className={cardClassName}>
                <span className={iconClassName}>
                  <Tags aria-hidden="true" className="size-6" />
                </span>

                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                  Research area keywords
                </h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {keywords.map((keyword) => (
                    <li
                      key={keyword}
                      className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-medium text-navy-200"
                    >
                      {keyword}
                    </li>
                  ))}
                </ul>
              </article>
            </TiltCard>
          </li>
        </ol>
      </HorizontalTrack>
    </section>
  );
}
