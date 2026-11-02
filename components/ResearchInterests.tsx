import HorizontalTrack from "@/components/ui/HorizontalTrack";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import type { ResearchInterest } from "@/data/professorData";

interface ResearchInterestsProps {
  interests: ResearchInterest[];
}

export default function ResearchInterests({ interests }: ResearchInterestsProps) {
  return (
    // The negative margin cancels the page's scroll padding, so a link to this section
    // lands where the stage engages instead of just above it.
    <section id="research" className="relative -scroll-mt-20 bg-navy-950 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-blueprint mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      />

      <HorizontalTrack label="Research pillars" ghostText="Research" cardCount={interests.length}>
        <div data-stop className="w-(--track-intro) shrink-0 snap-center">
          <Reveal>
            <SectionHeading
              eyebrow="Research"
              title="Research pillars"
              description="The lab studies how software is built, verified, and operated, with a growing focus on systems that include machine learning."
              tone="dark"
            />
            <p className="mt-6 font-mono text-xs text-accent-300">
              <span className="lg:hidden">Swipe through the {interests.length} pillars</span>
              <span className="hidden lg:inline">
                Keep scrolling through the {interests.length} pillars
              </span>
            </p>
          </Reveal>
        </div>

        <ol className="flex items-center gap-(--track-gap)">
          {interests.map(({ id, title, description, icon: Icon, tags }, index) => (
            <li
              key={id}
              data-stop
              className={`w-(--track-card) shrink-0 snap-center ${
                index % 2 === 0 ? "lg:mb-28" : "lg:mt-28"
              }`}
            >
              <TiltCard>
                <article className="group flex min-h-92 flex-col rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl shadow-black/40">
                  <div className="flex items-start justify-between">
                    <span className="clip-hexagon flex size-14 items-center justify-center bg-linear-to-br from-accent-300 to-accent-600 text-navy-950 transition-transform duration-300 group-hover:rotate-6">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <span aria-hidden="true" className="font-mono text-xs text-navy-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-navy-200">{description}</p>

                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-medium text-navy-200"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </article>
              </TiltCard>
            </li>
          ))}
        </ol>
      </HorizontalTrack>
    </section>
  );
}
