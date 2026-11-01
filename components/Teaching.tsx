import { FileText } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Course } from "@/data/professorData";

interface TeachingProps {
  courses: Course[];
}

export default function Teaching({ courses }: TeachingProps) {
  return (
    <section id="teaching" className="bg-background py-20 lg:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Teaching"
            title="Courses"
            description="Undergraduate and graduate courses in software engineering, testing, reliability, and developer experience."
          />
        </Reveal>

        <ul className="mt-12 divide-y divide-navy-100 border-y border-navy-100">
          {courses.map((course) => {
            const { id, code, title, level, credits, description, semester, year } = course;
            const { syllabus, tags } = course;

            return (
              <li key={id}>
                <Reveal className="grid gap-4 py-8 md:grid-cols-[11rem_1fr]">
                  <div>
                    <p className="font-display text-lg font-bold text-accent-700">{code}</p>
                    <p className="mt-1 text-sm font-medium text-navy-700">{level}</p>
                    <p className="text-sm text-navy-500">
                      {semester} {year} · {credits} credits
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy-900">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy-600">{description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {syllabus && (
                        <a
                          href={syllabus}
                          className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:text-accent-800"
                        >
                          <FileText aria-hidden="true" className="size-4" />
                          Syllabus
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
