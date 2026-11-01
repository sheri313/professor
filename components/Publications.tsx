"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import TiltCard from "@/components/ui/TiltCard";
import type { Publication, PublicationType } from "@/data/professorData";
import { formatCount } from "@/utils/animations";

interface PublicationsProps {
  publications: Publication[];
  highlightAuthor: string;
}

interface PublicationCardProps {
  publication: Publication;
  highlightAuthor: string;
}

interface CitationDrawerProps {
  id: string;
  publication: Publication;
  open: boolean;
}

interface BibtexLinesProps {
  bibtex: string;
}

interface CommandLineProps {
  typeFilter: TypeFilter;
  query: string;
}

type TypeFilter = PublicationType | "all";
type CopyStatus = "idle" | "copied" | "failed";

interface FilterTab {
  value: TypeFilter;
  label: string;
}

interface TypeBadge {
  label: string;
  className: string;
}

const filterTabs: FilterTab[] = [
  { value: "all", label: "All" },
  { value: "journal", label: "Journal Papers" },
  { value: "conference", label: "Conference Proceedings" },
  { value: "patent", label: "Patents" },
];

const typeBadges: Record<PublicationType, TypeBadge> = {
  journal: { label: "Journal Paper", className: "border-sky-400/30 text-sky-300" },
  conference: { label: "Conference Paper", className: "border-accent-400/30 text-accent-300" },
  patent: { label: "Patent", className: "border-amber-400/30 text-amber-300" },
};

const BIBTEX_FIELD = /^(\s*)(\w+)(\s*=\s*)(.*)$/;

const panelLabelClassName = "font-mono text-xs uppercase tracking-widest text-navy-400";
const actionClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs font-medium text-navy-200 transition-colors hover:border-accent-400/60 hover:text-accent-300";

function matchesQuery({ title, authors, tags }: Publication, query: string): boolean {
  return [title, ...authors, ...tags].join(" ").toLowerCase().includes(query);
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
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-ink-950">
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
          <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap wrap-break-word p-4 font-mono text-xs leading-5 text-navy-300">
            <code>
              <BibtexLines bibtex={publication.bibtex} />
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function PublicationCard({ publication, highlightAuthor }: PublicationCardProps) {
  const { title, authors, venue, year, type, doi, pdfUrl, tags, award, citations } = publication;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();
  const badge = typeBadges[type];

  return (
    <article className="rounded-2xl border border-white/10 bg-ink-900 p-5 transition-colors duration-200 hover:border-white/20 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="font-medium text-navy-200">{year}</span>
        <span className={`rounded border px-2 py-0.5 ${badge.className}`}>{badge.label}</span>
        {award && (
          <span className="inline-flex items-center gap-1 rounded bg-accent-400/10 px-2 py-0.5 text-accent-300">
            <Award aria-hidden="true" className="size-3.5" />
            {award}
          </span>
        )}
        <span className="ml-auto text-navy-400">{formatCount(citations)} citations</span>
      </div>

      <h3 className="mt-3 text-pretty font-display text-lg font-bold leading-snug text-white sm:text-xl">
        {title}
      </h3>

      <p className="mt-2 text-sm text-navy-200">
        {authors.map((author, index) => (
          <Fragment key={author}>
            {index > 0 && ", "}
            {author === highlightAuthor ? (
              <strong className="font-semibold text-accent-300">{author}</strong>
            ) : (
              author
            )}
          </Fragment>
        ))}
      </p>
      <p className="mt-1 text-sm italic text-navy-300">{venue}</p>

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-navy-400">
        {tags.map((tag) => (
          <li key={tag}>#{tag}</li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {doi && (
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClassName}
          >
            <ExternalLink aria-hidden="true" className="size-3.5" />
            DOI Link
          </a>
        )}
        {pdfUrl && (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={actionClassName}>
            <FileText aria-hidden="true" className="size-3.5" />
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
          <Quote aria-hidden="true" className="size-3.5" />
          Cite / BibTeX
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 transition-transform duration-300 ${drawerOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <CitationDrawer id={drawerId} publication={publication} open={drawerOpen} />
    </article>
  );
}

function CommandLine({ typeFilter, query }: CommandLineProps) {
  const flags = [
    typeFilter !== "all" && `--type=${typeFilter}`,
    query.trim() && `--query="${query.trim()}"`,
    "--sort=year",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p aria-hidden="true" className="truncate font-mono text-xs text-navy-300">
      <span className="text-accent-400">$</span> publications list {flags}
      <span className="terminal-caret" />
    </p>
  );
}

export default function Publications({ publications, highlightAuthor }: PublicationsProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const streamRef = useRef<HTMLDivElement>(null);

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

  const visibleCitations = visible.reduce((total, { citations }) => total + citations, 0);

  const countFor = (value: TypeFilter) =>
    value === "all"
      ? publications.length
      : publications.filter(({ type }) => type === value).length;

  // A shorter list can pull the page out from under the sticky panel, so bring the
  // top of the stream back into view instead of dropping the reader into the next section.
  const keepStreamInView = () => {
    const stream = streamRef.current;
    if (stream && stream.getBoundingClientRect().top < 0) stream.scrollIntoView({ block: "start" });
  };

  const changeType = (value: TypeFilter) => {
    setTypeFilter(value);
    keepStreamInView();
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    keepStreamInView();
  };

  const resetFilters = () => {
    changeQuery("");
    changeType("all");
  };

  return (
    <section id="publications" className="relative bg-ink-950 py-20 lg:py-28">
      <div aria-hidden="true" className="absolute inset-0 bg-scanlines" />

      <div className="page-container-wide">
        <Reveal>
          <SectionHeading
            eyebrow="Publications"
            title="Selected publications"
            description="Browse by type or search by title, keyword, or author. Every entry includes a ready-to-copy BibTeX citation."
            tone="dark"
          />
        </Reveal>

        <div className="mt-12 rounded-2xl border border-white/10 bg-ink-900/60">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-400/80" />
              <span className="size-2.5 rounded-full bg-amber-300/80" />
              <span className="size-2.5 rounded-full bg-accent-400/80" />
            </span>
            <span className="font-mono text-xs text-navy-300">~/software-intelligence-lab/dossier</span>
          </div>

          <div className="grid lg:grid-cols-[19rem_minmax(0,1fr)]">
            <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
              <div className="p-5 lg:sticky lg:top-20">
                <label htmlFor="publication-search" className={panelLabelClassName}>
                  Search<span className="sr-only"> publications by title, keyword, or author</span>
                </label>
                <div className="relative mt-2">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent-400"
                  />
                  <input
                    id="publication-search"
                    type="search"
                    value={query}
                    onChange={(event) => changeQuery(event.target.value)}
                    placeholder="Title, keyword, author"
                    className="w-full rounded-lg border border-white/10 bg-ink-950 py-2.5 pl-9 pr-3 font-mono text-sm text-white transition-colors placeholder:text-navy-400 focus:border-accent-400/60"
                  />
                </div>

                <p id="publication-filter-label" className={`mt-6 ${panelLabelClassName}`}>
                  Filter by type
                </p>
                <div
                  role="group"
                  aria-labelledby="publication-filter-label"
                  className="mt-2 flex flex-wrap gap-1.5 lg:flex-col"
                >
                  {filterTabs.map(({ value, label }) => {
                    const selected = typeFilter === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => changeType(value)}
                        className={`relative flex items-center justify-between gap-3 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                          selected ? "text-navy-950" : "text-navy-200 hover:text-white"
                        }`}
                      >
                        {selected && (
                          <motion.span
                            layoutId="publication-filter-tab"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            className="absolute inset-0 rounded-full bg-accent-400"
                          />
                        )}
                        <span className="relative">{label}</span>
                        <span className="relative font-mono text-xs opacity-70">
                          {countFor(value)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-1 border-t border-white/10 pt-4 font-mono text-xs text-navy-300">
                  <p aria-live="polite">
                    Showing {visible.length} of {publications.length} publications
                  </p>
                  <p>{formatCount(visibleCitations)} citations in view</p>
                </div>
              </div>
            </div>

            <div ref={streamRef} className="min-w-0 p-4 sm:p-5 lg:min-h-160">
              <CommandLine typeFilter={typeFilter} query={query} />

              {visible.length > 0 ? (
                <ul className="relative mt-4 space-y-4">
                  <AnimatePresence initial={false} mode="popLayout">
                    {visible.map((publication) => (
                      <motion.li
                        key={publication.id}
                        layout="position"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        <Reveal>
                          <TiltCard tilt={false}>
                            <PublicationCard
                              publication={publication}
                              highlightAuthor={highlightAuthor}
                            />
                          </TiltCard>
                        </Reveal>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-10 text-center">
                  <p className="font-mono text-sm text-white">No publications match your search.</p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-sm font-semibold text-accent-300 hover:text-accent-200"
                  >
                    Clear search and filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
