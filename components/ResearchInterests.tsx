import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import type { ResearchInterest } from "@/data/professorData";

interface ResearchInterestsProps {
  interests: ResearchInterest[];
}

export default function ResearchInterests({ interests }: ResearchInterestsProps) {
  return (
    <section id="research" className="bg-navy-50 py-20 lg:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Research"
            title="Research pillars"
            description="The lab studies how software is built, verified, and operated, with a growing focus on systems that include machine learning."
          />
        </Reveal>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {interests.map(({ id, title, description, icon: Icon, tags }, index) => (
            <li key={id}>
              <Reveal delay={index * 0.05} className="h-full">
                <TiltCard>
                  <article className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 transition-shadow duration-200 hover:shadow-lg hover:shadow-navy-900/5">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-accent-50 text-accent-700 transition-colors duration-200 group-hover:bg-accent-700 group-hover:text-white">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-navy-600">{description}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </TiltCard>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
