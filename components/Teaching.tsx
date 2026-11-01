import { Download } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Course, CourseLevel, CourseStatus } from "@/data/professorData";

interface TeachingProps {
  courses: Course[];
}

interface CourseRowProps {
  course: Course;
}

interface CourseGroup {
  status: CourseStatus;
  title: string;
}

const courseGroups: CourseGroup[] = [
  { status: "current", title: "Current courses" },
  { status: "past", title: "Past courses" },
];

const levelBadges: Record<CourseLevel, string> = {
  Undergraduate: "bg-navy-100 text-navy-700",
  Graduate: "bg-accent-100 text-accent-900",
};

function CourseRow({ course }: CourseRowProps) {
  const { code, title, level, credits, description, semester, year } = course;
  const { syllabus, materials = [], tags } = course;
  const downloads = syllabus ? [{ label: "Syllabus", href: syllabus }, ...materials] : materials;

  return (
    <article className="grid gap-4 py-8 md:grid-cols-[11rem_1fr] md:gap-6">
      <div>
        <p className="font-display text-lg font-bold text-accent-700">{code}</p>
        <p className="mt-1 text-sm font-medium text-navy-700">
          {semester} {year}
        </p>
        <p className="text-sm text-navy-500">{credits} credits</p>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h4 className="font-display text-lg font-bold text-navy-900">{title}</h4>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelBadges[level]}`}>
            {level}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-navy-600">{description}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-600"
            >
              {tag}
            </li>
          ))}
        </ul>

        {downloads.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {downloads.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  download
                  aria-label={`Download ${label} for ${code} (PDF)`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-sm font-semibold text-navy-700 transition-colors hover:border-accent-500 hover:text-accent-700"
                >
                  <Download aria-hidden="true" className="size-4" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default function Teaching({ courses }: TeachingProps) {
  return (
    <section id="teaching" className="bg-background py-20 lg:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Teaching"
            title="Courses"
            description="Undergraduate and graduate courses in software engineering, testing, reliability, and developer experience, with syllabi and course materials to download."
          />
        </Reveal>

        <div className="mt-10 space-y-10">
          {courseGroups.map(({ status, title }) => {
            const group = courses
              .filter((course) => course.status === status)
              .sort((a, b) => b.year - a.year || a.code.localeCompare(b.code));

            if (group.length === 0) return null;

            return (
              <div key={status}>
                <h3 className="font-display text-xl font-bold text-navy-900">{title}</h3>
                <ul className="mt-2 divide-y divide-navy-100 border-y border-navy-100">
                  {group.map((course) => (
                    <li key={course.id}>
                      <Reveal>
                        <CourseRow course={course} />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
