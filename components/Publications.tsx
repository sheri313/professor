"use client";

import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Award,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Quote,
  Search,
  TriangleAlert,
} from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Publication, PublicationType } from "@/data/professorData";
import { formatCount, prefersReducedMotion } from "@/utils/animations";
import { springEase } from "@/utils/sectionMotion";

interface PublicationsProps {
  publications: Publication[];
  highlightAuthor: string;
}

interface BookPanelProps {
  publication: Publication;
  highlightAuthor: string;
  active: boolean;
}

interface CitationDrawerProps {
  id: string;
  publication: Publication;
  open: boolean;
}

interface BibtexLinesProps {
  bibtex: string;
}

type TypeFilter = PublicationType | "all";
type CopyStatus = "idle" | "copied" | "failed";

interface FilterTab {
  value: TypeFilter;
  label: string;
}

interface TypeStyle {
  label: string;
  spine: string;
  dot: string;
}

const filterTabs: FilterTab[] = [
  { value: "all", label: "All" },
  { value: "journal", label: "Journal Papers" },
  { value: "conference", label: "Conference Proceedings" },
  { value: "patent", label: "Patents" },
];

const typeStyles: Record<PublicationType, TypeStyle> = {
  journal: { label: "Journal Paper", spine: "bg-navy-800 text-white", dot: "bg-navy-800" },
  conference: { label: "Conference Paper", spine: "bg-accent-700 text-white", dot: "bg-accent-700" },
  patent: { label: "Patent", spine: "bg-amber-300 text-amber-950", dot: "bg-amber-400" },
};

const BIBTEX_FIELD = /^(\s*)(\w+)(\s*=\s*)(.*)$/;
// The shortest book, as a share of the shelf. Square root, so one heavily cited
// paper can't flatten everything else into the same short height.
const MIN_SPINE_SHARE = 58;

const actionClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm font-semibold text-navy-700 transition-colors hover:border-accent-500 hover:text-accent-700";

function matchesQuery({ title, authors, tags }: Publication, query: string): boolean {
  return [title, ...authors, ...tags].join(" ").toLowerCase().includes(query);
}

function getSpineTitle(title: string): string {
  return title.split(":")[0];
}

function getSpineHeight(citations: number, mostCitations: number): string {
  const share = Math.sqrt(citations / mostCitations);
  return `${MIN_SPINE_SHARE + (100 - MIN_SPINE_SHARE) * share}%`;
}

function BibtexLines({ bibtex }: BibtexLinesProps) {
  return bibtex.split("\n").map((line, index) => {
    const field = line.match(BIBTEX_FIELD);

    return (
      <Fragment key={index}>
        {field ? (
          <>
            {field[1]}
            <span className="text-sky-300">{field[2]}</span>
            {field[3]}
            <span className="text-navy-100">{field[4]}</span>
          </>
        ) : (
          <span className="text-accent-300">{line}</span>
        )}
        {"\n"}
      </Fragment>
    );
  });
}

// Slides open on grid rows. Unlike a height animation, nothing has to be measured,
// and framer-motion measuring height calls window.scrollTo (see Navbar).
function CitationDrawer({ id, publication, open }: CitationDrawerProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publication.bibtex);
      setStatus("copied");
    } catch {
      // Clipboard access needs a secure context and can be denied by the browser.
      setStatus("failed");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const { icon: Icon, label } = {
    idle: { icon: Copy, label: "Copy BibTeX" },
    copied: { icon: Check, label: "Copied!" },
    failed: { icon: TriangleAlert, label: "Copy failed" },
  }[status];

  return (
    <div
      id={id}
      inert={!open}
      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="mt-4 overflow-hidden rounded-xl bg-ink-950">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
            <span className="font-mono text-xs text-navy-400">citation.bib</span>
            <button
              type="button"
              onClick={copy}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                status === "copied"
                  ? "bg-accent-400 text-navy-950"
                  : "bg-white/10 text-white hover:bg-accent-400 hover:text-navy-950"
              }`}
            >
              <Icon aria-hidden="true" className="size-3.5" />
              <span aria-live="polite">{label}</span>
            </button>
          </div>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap wrap-break-word p-4 font-mono text-xs leading-5 text-navy-300">
            <code>
              <BibtexLines bibtex={publication.bibtex} />
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

// Every book is always in the document, stacked in one grid cell like the lab's
// member panels, so the shelf below never jumps and each abstract stays searchable.
function BookPanel({ publication, highlightAuthor, active }: BookPanelProps) {
  const { title, authors, venue, year, type, doi, pdfUrl, tags, award, citations, abstract } =
    publication;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();

  return (
    <article
      className={`book-panel col-start-1 row-start-1 grid gap-8 p-6 transition-[opacity,translate,visibility] duration-300 ease-out sm:p-9 lg:grid-cols-2 lg:gap-14 ${
        active ? "" : "invisible translate-y-2 opacity-0"
      }`}
    >
      <div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-navy-500">
          <span className="inline-flex items-center gap-1.5 font-medium text-navy-800">
            <span aria-hidden="true" className={`size-2 rounded-full ${typeStyles[type].dot}`} />
            {typeStyles[type].label}
          </span>
          <span>{year}</span>
          <span>{formatCount(citations)} citations</span>
        </p>
        {award && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            <Award aria-hidden="true" className="size-3.5" />
            {award}
          </p>
        )}
        <h3 className="mt-4 text-pretty font-display text-2xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-navy-700">
          {authors.map((author, index) => (
            <Fragment key={author}>
              {index > 0 && ", "}
              {author === highlightAuthor ? (
                <strong className="font-semibold text-accent-800">{author}</strong>
              ) : (
                author
              )}
            </Fragment>
          ))}
        </p>
        <p className="mt-1 text-sm italic text-navy-500">{venue}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-navy-600 ring-1 ring-navy-200"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 lg:border-l lg:border-navy-200 lg:pl-14">
        <h4 className="font-mono text-xs uppercase tracking-widest text-navy-500">Abstract</h4>
        <p className="mt-3 leading-7 text-navy-700">{abstract}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {doi && (
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className={actionClassName}
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              DOI Link
            </a>
          )}
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={actionClassName}>
              <FileText aria-hidden="true" className="size-4" />
              PDF
            </a>
          )}
          <button
            type="button"
            aria-expanded={drawerOpen}
            aria-controls={drawerId}
            onClick={() => setDrawerOpen((open) => !open)}
            className={actionClassName}
          >
            <Quote aria-hidden="true" className="size-4" />
            Cite / BibTeX
            <ChevronDown
              aria-hidden="true"
              className={`size-4 transition-transform duration-300 ${drawerOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <CitationDrawer id={drawerId} publication={publication} open={drawerOpen} />
      </div>
    </article>
  );
}

export default function Publications({ publications, highlightAuthor }: PublicationsProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [activeId, setActiveId] = useState<string>();
  const shelfRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return publications
      .filter(
        (publication) =>
          (typeFilter === "all" || publication.type === typeFilter) &&
          (!normalizedQuery || matchesQuery(publication, normalizedQuery)),
      )
      .sort((a, b) => b.year - a.year || b.citations - a.citations);
  }, [publications, query, typeFilter]);

  // Filtering can take the open book off the shelf, so fall back to the first one left.
  const active = visible.find(({ id }) => id === activeId) ?? visible[0];
  const mostCitations = Math.max(...publications.map(({ citations }) => citations));

  const countFor = (value: TypeFilter) =>
    value === "all"
      ? publications.length
      : publications.filter(({ type }) => type === value).length;

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
  };

  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf || prefersReducedMotion()) return;

    const context = gsap.context(() => {
      // Paused rather than attached to the trigger, which would measure every book.
      const rise = gsap.fromTo(
        "[data-spine]",
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1,
          ease: springEase(0.7, 9),
          stagger: 0.05,
          paused: true,
          clearProps: "transform",
        },
      );

      ScrollTrigger.create({
        trigger: shelf,
        start: "top 80%",
        end: "max",
        onEnter: (self) => {
          self.kill();
          rise.play();
        },
      });
    }, shelf);

    return () => context.revert();
  }, []);

  return (
    <section id="publications" className="relative bg-background py-20 lg:py-28">
      <div className="page-container-wide">
        <Reveal>
          <SectionHeading
            eyebrow="Publications"
            title="The lab's bookshelf"
            description="Every paper on one shelf, with taller spines for more citations. Pick one to open it, or narrow the shelf by type, title, keyword, or author."
          />
        </Reveal>

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter by publication type" className="flex flex-wrap gap-1.5">
            {filterTabs.map(({ value, label }) => {
              const selected = typeFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTypeFilter(value)}
                  className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    selected ? "text-white" : "text-navy-600 hover:text-navy-900"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="publication-filter-tab"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-navy-900"
                    />
                  )}
                  {value !== "all" && (
                    <span
                      aria-hidden="true"
                      className={`relative size-2 rounded-full ${typeStyles[value].dot}`}
                    />
                  )}
                  <span className="relative">{label}</span>
                  <span className="relative font-mono text-xs opacity-70">{countFor(value)}</span>
                </button>
              );
            })}
          </div>

          <div className="relative lg:w-80">
            <label htmlFor="publication-search" className="sr-only">
              Search publications by title, keyword, or author
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-400"
            />
            <input
              id="publication-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, keyword, or author"
              className="w-full rounded-full border border-navy-200 bg-white py-2.5 pl-9 pr-3 text-sm text-navy-800 placeholder:text-navy-400"
            />
          </div>
        </div>

        <p aria-live="polite" className="mt-4 font-mono text-xs text-navy-500">
          Showing {visible.length} of {publications.length} publications
        </p>

        <div ref={shelfRef} className="mt-2">
          {visible.length > 0 ? (
            <ul className="flex h-96 items-end gap-1.5 overflow-x-auto overflow-y-hidden px-1 pt-6">
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map(({ id, title, year, type, citations, award }) => {
                  const open = id === active?.id;
                  return (
                    <motion.li
                      key={id}
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ height: getSpineHeight(citations, mostCitations) }}
                      className="min-w-16 flex-1"
                    >
                      <div data-spine className="h-full">
                        <button
                          type="button"
                          aria-pressed={open}
                          aria-label={`${title}, ${year}`}
                          onClick={() => setActiveId(id)}
                          className={`relative flex size-full flex-col items-center justify-between gap-3 overflow-hidden rounded-t-md px-1 pb-3 pt-4 -outline-offset-2 transition-[translate,box-shadow] duration-300 ease-out ${typeStyles[type].spine} ${
                            open
                              ? "translate-y-0 shadow-[0_0_0_3px_var(--color-accent-400)]"
                              : "translate-y-3 hover:translate-y-0"
                          }`}
                        >
                          {award && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-x-0 top-0 h-1.5 bg-amber-300"
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className="min-h-0 flex-1 rotate-180 overflow-hidden text-left font-display text-sm font-bold leading-tight [writing-mode:vertical-rl]"
                          >
                            {getSpineTitle(title)}
                          </span>
                          <span aria-hidden="true" className="font-mono text-[0.6875rem] opacity-80">
                            {year}
                          </span>
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <p className="font-semibold text-navy-900">No publications match your search.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm font-semibold text-accent-700 hover:text-accent-800"
              >
                Clear search and filters
              </button>
            </div>
          )}

          <div aria-hidden="true" className="h-3 rounded-sm bg-navy-900 shadow-lg shadow-navy-900/30" />
        </div>

        <div className="mt-6 grid rounded-3xl bg-navy-50">
          {publications.map((publication) => (
            <BookPanel
              key={publication.id}
              publication={publication}
              highlightAuthor={highlightAuthor}
              active={publication.id === active?.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
