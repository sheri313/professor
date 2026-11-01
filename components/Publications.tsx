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
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Publication, PublicationType } from "@/data/professorData";

interface PublicationsProps {
  publications: Publication[];
  highlightAuthor: string;
}

interface PublicationCardProps {
  publication: Publication;
  highlightAuthor: string;
}

interface ExternalActionProps {
  href: string;
  children: ReactNode;
}

interface PanelToggleProps {
  label: string;
  panelId: string;
  open: boolean;
  onClick: () => void;
}

type TypeFilter = PublicationType | "all";
type YearFilter = number | "all";
type Panel = "abstract" | "bibtex";
type CopyStatus = "idle" | "copied" | "failed";

const typeLabels: Record<PublicationType, string> = {
  journal: "Journal",
  conference: "Conference",
  workshop: "Workshop",
  "book-chapter": "Book chapter",
  preprint: "Preprint",
};

const ALL_TOPICS = "all";

function matchesQuery(publication: Publication, query: string): boolean {
  const haystack = [
    publication.title,
    publication.venue,
    publication.abstract,
    ...publication.authors,
    ...publication.tags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function ExternalAction({ href, children }: ExternalActionProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900"
    >
      {children}
    </a>
  );
}

function PanelToggle({ label, panelId, open, onClick }: PanelToggleProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
        open
          ? "bg-accent-50 text-accent-800"
          : "text-navy-600 hover:bg-navy-100 hover:text-navy-900"
      }`}
    >
      {label}
      <ChevronDown
        aria-hidden="true"
        className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function CopyBibtexButton({ bibtex }: { bibtex: string }) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
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
    copied: { icon: Check, label: "Copied" },
    failed: { icon: TriangleAlert, label: "Copy failed" },
  }[status];

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md border border-navy-600 px-2.5 py-1 text-xs font-semibold text-navy-100 transition-colors hover:border-navy-400"
    >
      <Icon aria-hidden="true" className="size-3.5" />
      <span aria-live="polite">{label}</span>
    </button>
  );
}

function PublicationCard({ publication, highlightAuthor }: PublicationCardProps) {
  const [openPanel, setOpenPanel] = useState<Panel | null>(null);
  const { id, title, authors, venue, year, type, doi, arxiv, pdfUrl } = publication;
  const { abstract, tags, citations, bibtex, award } = publication;

  const togglePanel = (panel: Panel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <article className="rounded-2xl border border-navy-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-white">{year}</span>
        <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-navy-700">
          {typeLabels[type]}
        </span>
        {award && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-0.5 text-accent-900">
            <Award aria-hidden="true" className="size-3.5" />
            {award}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-navy-900">{title}</h3>

      <p className="mt-2 text-sm text-navy-600">
        {authors.map((author, index) => (
          <Fragment key={author}>
            {index > 0 && ", "}
            {author === highlightAuthor ? (
              <strong className="font-semibold text-navy-900">{author}</strong>
            ) : (
              author
            )}
          </Fragment>
        ))}
      </p>
      <p className="mt-1 text-sm italic text-navy-500">{venue}</p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs text-navy-600">
            {tag}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-navy-100 pt-3">
        <PanelToggle
          label="Abstract"
          panelId={`${id}-abstract`}
          open={openPanel === "abstract"}
          onClick={() => togglePanel("abstract")}
        />
        <PanelToggle
          label="BibTeX"
          panelId={`${id}-bibtex`}
          open={openPanel === "bibtex"}
          onClick={() => togglePanel("bibtex")}
        />
        {doi && (
          <ExternalAction href={`https://doi.org/${doi}`}>
            <ExternalLink aria-hidden="true" className="size-3.5" />
            DOI
          </ExternalAction>
        )}
        {arxiv && (
          <ExternalAction href={`https://arxiv.org/abs/${arxiv}`}>
            <ExternalLink aria-hidden="true" className="size-3.5" />
            arXiv
          </ExternalAction>
        )}
        {pdfUrl && (
          <ExternalAction href={pdfUrl}>
            <FileText aria-hidden="true" className="size-3.5" />
            PDF
          </ExternalAction>
        )}
        <span className="ml-auto inline-flex items-center gap-1 px-2 text-sm text-navy-500">
          <Quote aria-hidden="true" className="size-3.5" />
          {citations.toLocaleString("en-US")} citations
        </span>
      </div>

      <AnimatePresence initial={false}>
        {openPanel && (
          <motion.div
            key={openPanel}
            id={`${id}-${openPanel}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {openPanel === "abstract" ? (
              <p className="mt-3 text-sm leading-6 text-navy-600">{abstract}</p>
            ) : (
              <div className="mt-3 rounded-xl bg-navy-900 p-4">
                <div className="flex justify-end">
                  <CopyBibtexButton bibtex={bibtex} />
                </div>
                <pre className="mt-2 overflow-x-auto text-xs leading-5 text-navy-100">
                  <code>{bibtex}</code>
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default function Publications({ publications, highlightAuthor }: PublicationsProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [topicFilter, setTopicFilter] = useState(ALL_TOPICS);

  const typeCounts = useMemo(() => {
    const counts = new Map<PublicationType, number>();
    for (const { type } of publications) {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return [...counts];
  }, [publications]);

  const years = useMemo(
    () => [...new Set(publications.map(({ year }) => year))].sort((a, b) => b - a),
    [publications],
  );

  const topics = useMemo(
    () => [...new Set(publications.flatMap(({ tags }) => tags))].sort((a, b) => a.localeCompare(b)),
    [publications],
  );

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return publications
      .filter(
        (publication) =>
          (typeFilter === "all" || publication.type === typeFilter) &&
          (yearFilter === "all" || publication.year === yearFilter) &&
          (topicFilter === ALL_TOPICS || publication.tags.includes(topicFilter)) &&
          (!normalizedQuery || matchesQuery(publication, normalizedQuery)),
      )
      .sort((a, b) => b.year - a.year || b.citations - a.citations);
  }, [publications, query, typeFilter, yearFilter, topicFilter]);

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setYearFilter("all");
    setTopicFilter(ALL_TOPICS);
  };

  const selectClassName =
    "rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700";
  const chipClassName = (selected: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      selected
        ? "bg-navy-900 text-white"
        : "bg-white text-navy-600 ring-1 ring-navy-200 hover:text-navy-900"
    }`;

  return (
    <section id="publications" className="bg-background py-20 lg:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Publications"
            title="Selected publications"
            description="Search or filter by venue type, year, and topic. Every entry includes a BibTeX citation."
          />
        </Reveal>

        <div className="mt-10 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <label htmlFor="publication-search" className="sr-only">
                Search publications
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
                placeholder="Search titles, authors, venues, and abstracts"
                className="w-full rounded-lg border border-navy-200 bg-white py-2 pl-9 pr-3 text-sm text-navy-800 placeholder:text-navy-400"
              />
            </div>

            <label className="sr-only" htmlFor="publication-year">
              Filter by year
            </label>
            <select
              id="publication-year"
              value={yearFilter}
              onChange={({ target }) =>
                setYearFilter(target.value === "all" ? "all" : Number(target.value))
              }
              className={selectClassName}
            >
              <option value="all">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="publication-topic">
              Filter by topic
            </label>
            <select
              id="publication-topic"
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              className={selectClassName}
            >
              <option value={ALL_TOPICS}>All topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            <button
              type="button"
              aria-pressed={typeFilter === "all"}
              onClick={() => setTypeFilter("all")}
              className={chipClassName(typeFilter === "all")}
            >
              All ({publications.length})
            </button>
            {typeCounts.map(([type, count]) => (
              <button
                key={type}
                type="button"
                aria-pressed={typeFilter === type}
                onClick={() => setTypeFilter(type)}
                className={chipClassName(typeFilter === type)}
              >
                {typeLabels[type]} ({count})
              </button>
            ))}
          </div>

          <p aria-live="polite" className="text-sm text-navy-500">
            Showing {visible.length} of {publications.length} publications
          </p>
        </div>

        {visible.length > 0 ? (
          <ul className="mt-6 space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((publication) => (
                <motion.li
                  key={publication.id}
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PublicationCard publication={publication} highlightAuthor={highlightAuthor} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-navy-200 p-10 text-center">
            <p className="font-semibold text-navy-900">No publications match these filters.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-sm font-semibold text-accent-700 hover:text-accent-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
