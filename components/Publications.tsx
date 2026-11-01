"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Quote,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import type { Publication, PublicationType } from "@/data/professorData";

interface PublicationsProps {
  publications: Publication[];
  highlightAuthor: string;
}

interface PublicationCardProps {
  publication: Publication;
  highlightAuthor: string;
  onCite: (publication: Publication) => void;
}

interface BibtexModalProps {
  publication: Publication;
  onClose: () => void;
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
  journal: { label: "Journal Paper", className: "bg-navy-900 text-white" },
  conference: { label: "Conference Paper", className: "bg-accent-100 text-accent-900" },
  patent: { label: "Patent", className: "bg-amber-100 text-amber-900" },
};

const actionClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-sm font-semibold text-navy-700 transition-colors hover:border-accent-500 hover:text-accent-700";

function matchesQuery({ title, authors, tags }: Publication, query: string): boolean {
  return [title, ...authors, ...tags].join(" ").toLowerCase().includes(query);
}

function BibtexModal({ publication, onClose }: BibtexModalProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const titleId = useId();

  // A layout effect, because close() must run while the dialog is still in the
  // document for the browser to return focus to the Cite button.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    copyButtonRef.current?.focus();
    return () => dialog?.close();
  }, []);

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
    <motion.dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Let the exit animation play instead of closing straight away.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center overflow-y-auto overscroll-contain bg-navy-950/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex max-h-full w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-5">
          <div className="min-w-0">
            <h3 id={titleId} className="font-display text-lg font-bold text-navy-900">
              Cite this publication
            </h3>
            <p className="mt-1 text-sm text-navy-600">{publication.title}</p>
          </div>
          <button
            type="button"
            aria-label="Close citation dialog"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-900"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap wrap-break-word bg-navy-900 p-5 text-xs leading-5 text-navy-100">
          <code>{publication.bibtex}</code>
        </pre>

        <div className="flex justify-end p-4">
          <button
            ref={copyButtonRef}
            type="button"
            onClick={copy}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              status === "copied" ? "bg-accent-800" : "bg-accent-700 hover:bg-accent-800"
            }`}
          >
            <Icon aria-hidden="true" className="size-4" />
            <span aria-live="polite">{label}</span>
          </button>
        </div>
      </motion.div>
    </motion.dialog>
  );
}

function PublicationCard({ publication, highlightAuthor, onCite }: PublicationCardProps) {
  const { title, authors, venue, year, type, doi, pdfUrl, tags, award } = publication;
  const badge = typeBadges[type];

  return (
    <article className="rounded-2xl border border-navy-100 bg-white p-5 transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className={`rounded-full px-2.5 py-0.5 ${badge.className}`}>{badge.label}</span>
        {award && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-0.5 text-accent-800">
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
              <strong className="font-semibold text-accent-800">{author}</strong>
            ) : (
              author
            )}
          </Fragment>
        ))}
      </p>
      <p className="mt-1 text-sm text-navy-500">
        <span className="italic">{venue}</span>, {year}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs text-navy-600">
            {tag}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
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
          aria-haspopup="dialog"
          onClick={() => onCite(publication)}
          className={actionClassName}
        >
          <Quote aria-hidden="true" className="size-4" />
          Cite / BibTeX
        </button>
      </div>
    </article>
  );
}

export default function Publications({ publications, highlightAuthor }: PublicationsProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [citing, setCiting] = useState<Publication | null>(null);

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

  const countFor = (value: TypeFilter) =>
    value === "all"
      ? publications.length
      : publications.filter(({ type }) => type === value).length;

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
  };

  return (
    <section id="publications" className="bg-background py-20 lg:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Publications"
            title="Selected publications"
            description="Browse by type or search by title, keyword, or author. Every entry includes a ready-to-copy BibTeX citation."
          />
        </Reveal>

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter by publication type"
            className="flex flex-wrap gap-1 self-start rounded-xl bg-navy-100 p-1"
          >
            {filterTabs.map(({ value, label }) => {
              const selected = typeFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTypeFilter(value)}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    selected ? "text-white" : "text-navy-600 hover:text-navy-900"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="publication-filter-tab"
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute inset-0 rounded-lg bg-navy-900"
                    />
                  )}
                  <span className="relative">
                    {label} <span className="font-normal opacity-70">({countFor(value)})</span>
                  </span>
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
              className="w-full rounded-lg border border-navy-200 bg-white py-2.5 pl-9 pr-3 text-sm text-navy-800 placeholder:text-navy-400"
            />
          </div>
        </div>

        <p aria-live="polite" className="mt-4 text-sm text-navy-500">
          Showing {visible.length} of {publications.length} publications
        </p>

        {visible.length > 0 ? (
          <ul className="mt-4 space-y-4">
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
                  <Reveal>
                    <TiltCard tilt={false}>
                      <PublicationCard
                        publication={publication}
                        highlightAuthor={highlightAuthor}
                        onCite={setCiting}
                      />
                    </TiltCard>
                  </Reveal>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-navy-200 p-10 text-center">
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
      </div>

      <AnimatePresence>
        {citing && (
          <BibtexModal key={citing.id} publication={citing} onClose={() => setCiting(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
