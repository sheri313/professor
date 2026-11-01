import { ChevronDown, Download } from "lucide-react";
import CourseTimeline from "@/components/ui/CourseTimeline";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Course, CourseLevel, Semester } from "@/data/professorData";

interface TeachingProps {
  courses: Course[];
}

interface CourseRowProps {
  course: Course;
  defaultOpen: boolean;
}

interface CourseTerm {
  label: string;
  year: number;
  semester: Semester;
  current: boolean;
  courses: Course[];
}

const semesterOrder: Record<Semester, number> = { Spring: 1, Summer: 2, Fall: 3 };

const levelBadges: Record<CourseLevel, string> = {
  Undergraduate: "border-white/15 text-navy-200",
  Graduate: "border-accent-400/30 text-accent-300",
};

function groupByTerm(courses: Course[]): CourseTerm[] {
  const terms = new Map<string, CourseTerm>();

  for (const course of courses) {
    const { semester, year, status } = course;
    const label = `${semester} ${year}`;
    const term = terms.get(label) ?? { label, year, semester, current: false, courses: [] };

    term.courses.push(course);
    term.current ||= status === "current";
    terms.set(label, term);
  }

  return [...terms.values()]
    .map((term) => ({
      ...term,
      courses: term.courses.toSorted((a, b) => a.code.localeCompare(b.code)),
    }))
    .sort(
      (a, b) => b.year - a.year || semesterOrder[b.semester] - semesterOrder[a.semester],
    );
}

function CourseRow({ course, defaultOpen }: CourseRowProps) {
  const { code, title, level, credits, description, tags } = course;
  const { syllabus, materials = [] } = course;
  const downloads = syllabus ? [{ label: "Syllabus", href: syllabus }, ...materials] : materials;

  return (
    <li data-course className="group/course relative">
      <span
        aria-hidden="true"
        className="absolute -left-8.5 top-7 size-3 rounded-full bg-navy-800 ring-2 ring-white/15 transition-[background-color,box-shadow] duration-500 group-data-reached/course:bg-accent-300 group-data-reached/course:ring-accent-300/40 group-data-reached/course:shadow-[0_0_16px_4px] group-data-reached/course:shadow-accent-400/60 lg:-left-10.5"
      />

      <details
        open={defaultOpen}
        className="disclosure group/row rounded-2xl border border-white/10 bg-white/3 transition-colors duration-500 open:bg-white/6 group-data-reached/course:border-accent-400/30"
      >
        <summary className="flex items-center gap-4 p-5 sm:px-6">
          <span className="w-16 shrink-0 font-mono text-sm font-medium text-accent-300">{code}</span>
          <h4 className="min-w-0 flex-1 font-display text-lg font-bold leading-snug text-white">
            {title}
          </h4>
          <ChevronDown
            aria-hidden="true"
            className="size-5 shrink-0 text-navy-300 transition-transform duration-300 group-open/row:rotate-180"
          />
        </summary>

        <div className="px-5 pb-6 sm:px-6">
          <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-navy-300">
            <span className={`rounded border px-2 py-0.5 ${levelBadges[level]}`}>{level}</span>
            {credits} credits
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-200">{description}</p>

          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-navy-400">
            {tags.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>

          {downloads.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {downloads.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    download
                    aria-label={`Download ${label} for ${code} (PDF)`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-navy-100 transition-colors hover:border-accent-400 hover:text-accent-300"
                  >
                    <Download aria-hidden="true" className="size-4" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}

export default function Teaching({ courses }: TeachingProps) {
  const terms = groupByTerm(courses);

  return (
    <section id="teaching" className="relative bg-navy-950 py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-blueprint mask-[radial-gradient(ellipse_at_right,black,transparent_70%)]"
      />

      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Teaching"
            title="Courses"
            description="Undergraduate and graduate courses in software engineering, testing, reliability, and developer experience, with syllabi and course materials to download."
            tone="dark"
          />
        </Reveal>

        <div className="mt-14">
          <CourseTimeline>
            <ol className="space-y-12">
              {terms.map(({ label, current, courses: termCourses }, termIndex) => (
                <li
                  key={label}
                  className="grid gap-y-4 pl-10 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-x-18 lg:pl-0"
                >
                  <h3 className="font-display text-lg font-bold text-white lg:sticky lg:top-24 lg:self-start lg:pt-5 lg:text-right">
                    {label}
                    {current && (
                      <span className="mt-1 flex items-center gap-1.5 font-mono text-xs font-medium text-accent-300 lg:justify-end">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
                        In session
                      </span>
                    )}
                  </h3>
                  <ul className="space-y-3">
                    {termCourses.map((course, courseIndex) => (
                      <CourseRow
                        key={course.id}
                        course={course}
                        defaultOpen={termIndex === 0 && courseIndex === 0}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </CourseTimeline>
        </div>
      </div>
    </section>
  );
}
