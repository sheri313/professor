"use client";

import { motion } from "framer-motion";
import gsap from "gsap";
import {
  Check,
  Copy,
  ExternalLink,
  Search,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import HorizontalTrack from "@/components/ui/HorizontalTrack";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Publication, PublicationType, ResearchOutputSummary } from "@/data/profile";
import { SMOOTH_EASE, formatCount, prefersReducedMotion } from "@/utils/animations";
import { springEase } from "@/utils/sectionMotion";

interface PublicationsProps {
  publications: Publication[];
  highlightAuthors: string[];
  outputs: ResearchOutputSummary;
}

interface AuthorListProps {
  authors: string[];
  highlightAuthors: string[];
  highlightClassName: string;
}

interface TypeBadgeProps {
  type: PublicationType;
}

interface PublicationModalProps {
  publication: Publication;
  highlightAuthors: string[];
  origin: DOMRect;
  onClose: () => void;
}

interface OpenDetails {
  publication: Publication;
  origin: DOMRect;
}

type TypeFilter = PublicationType | "all";
type CopyStatus = "idle" | "copied" | "failed";

interface FilterTab {
  value: TypeFilter;
  label: string;
}

const filterTabs: FilterTab[] = [
  { value: "all", label: "All" },
  { value: "article", label: "Articles" },
  { value: "review", label: "Review articles" },
  { value: "letter", label: "Letters" },
  { value: "comment", label: "Comment / debate" },
  { value: "conference", label: "Conference papers" },
  { value: "abstract", label: "Abstracts" },
  { value: "report", label: "Reports" },
];

const typeColors: Record<PublicationType, string> = {
  article: "#10b981",
  review: "#2dd4bf",
  letter: "#a78bfa",
  comment: "#f472b6",
  conference: "#0ea5e9",
  abstract: "#f59e0b",
  report: "#94a3b8",
};

const typeLabels: Record<PublicationType, string> = {
  article: "Article",
  review: "Review article",
  letter: "Letter",
  comment: "Comment / debate",
  conference: "Conference paper",
  abstract: "Abstract",
  report: "Report",
};

const modalActionClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors";

function matchesQuery({ title, authors, venue }: Publication, query: string): boolean {
  return [title, venue, ...authors].join(" ").toLowerCase().includes(query);
}

function AuthorList({ authors, highlightAuthors, highlightClassName }: AuthorListProps) {
  return authors.map((author, index) => (
    <Fragment key={author}>
      {index > 0 && ", "}
      {highlightAuthors.includes(author) ? (
        <strong className={highlightClassName}>{author}</strong>
      ) : (
        author
      )}
    </Fragment>
  ));
}

function TypeBadge({ type }: TypeBadgeProps) {
  const color = typeColors[type];

  return (
    <span
      style={{ color, borderColor: `${color}66`, backgroundColor: `${color}1f` }}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
    >
      <span aria-hidden="true" style={{ backgroundColor: color }} className="size-1.5 rounded-full" />
      {typeLabels[type]}
    </span>
  );
}

// Where the panel has to start from to sit exactly over the tile that opened it.
function getOriginOffset(panel: HTMLElement, origin: DOMRect): gsap.TweenVars {
  const rest = panel.getBoundingClientRect();

  return {
    x: origin.left - rest.left,
    y: origin.top - rest.top,
    scaleX: origin.width / rest.width,
    scaleY: origin.height / rest.height,
    transformOrigin: "0 0",
  };
}

function PublicationModal({ publication, highlightAuthors, origin, onClose }: PublicationModalProps) {
  const { title, authors, venue, details, year, type, doi, scopusCitations, bibtex } = publication;
  const [status, setStatus] = useState<CopyStatus>("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closing = useRef(false);
  const titleId = useId();

  // A layout effect, because the panel has to be measured and moved over the tile before
  // the first paint, and close() must run while the dialog is still in the document for
  // the browser to return focus to the button that opened it.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog || !panel) return;

    dialog.showModal();
    copyButtonRef.current?.focus();

    const context = gsap.context(() => {
      gsap.to(dialog, { backgroundColor: "rgb(12 20 35 / 0.72)", duration: 0.5, ease: "power2.out" });

      if (prefersReducedMotion()) {
        gsap.from(panel, { opacity: 0, duration: 0.25 });
        return;
      }

      gsap.from(panel, {
        ...getOriginOffset(panel, origin),
        duration: 0.85,
        ease: springEase(0.82, 9),
        clearProps: "transform",
      });
      gsap.from("[data-detail]", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        delay: 0.28,
        stagger: 0.06,
        ease: SMOOTH_EASE,
        clearProps: "opacity,transform",
      });
    }, dialog);

    return () => {
      context.revert();
      dialog.close();
    };
  }, [origin]);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  // Wheeling over the backdrop would otherwise scroll the page behind the modal.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const holdPageScroll = (event: WheelEvent) => {
      const panel = panelRef.current;
      const insidePanel = panel?.contains(event.target as Node);
      if (!insidePanel || panel!.scrollHeight <= panel!.clientHeight) event.preventDefault();
    };

    dialog.addEventListener("wheel", holdPageScroll, { passive: false });
    return () => dialog.removeEventListener("wheel", holdPageScroll);
  }, []);

  const requestClose = () => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (closing.current || !dialog || !panel) return;

    closing.current = true;
    if (prefersReducedMotion()) {
      onClose();
      return;
    }

    gsap.to(dialog, { backgroundColor: "rgb(12 20 35 / 0)", duration: 0.4 });
    gsap.to(panel, {
      ...getOriginOffset(panel, origin),
      opacity: 0.4,
      duration: 0.42,
      ease: "power3.in",
      onComplete: onClose,
    });
  };

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

  const { icon: CopyIcon, label: copyLabel } = {
    idle: { icon: Copy, label: "Copy BibTeX" },
    copied: { icon: Check, label: "Copied!" },
    failed: { icon: TriangleAlert, label: "Copy failed" },
  }[status];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Let the panel fly back to its tile instead of closing straight away.
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-transparent"
    >
      <div
        ref={panelRef}
        className="relative max-h-full w-full max-w-2xl overflow-y-auto overscroll-contain rounded-3xl border border-white/20 bg-navy-900/90 p-6 text-white shadow-[0_40px_90px_-20px_rgb(0_0_0/0.8),0_0_70px_-20px_rgb(16_185_129/0.45)] backdrop-blur-xl sm:p-8"
      >
        <button
          type="button"
          aria-label="Close publication details"
          onClick={requestClose}
          className="absolute right-4 top-4 rounded-full p-2 text-navy-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <p data-detail className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-10 font-mono text-xs text-navy-200">
          <TypeBadge type={type} />
          <span>{year}</span>
          <span>
            {formatCount(scopusCitations)} {scopusCitations === 1 ? "citation" : "citations"} (Scopus)
          </span>
        </p>

        <h3
          id={titleId}
          data-detail
          className="mt-3 text-pretty font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl"
        >
          {title}
        </h3>

        <div data-detail>
          <p className="mt-3 text-navy-100">
            <AuthorList
              authors={authors}
              highlightAuthors={highlightAuthors}
              highlightClassName="font-semibold text-accent-300"
            />
          </p>
          <p className="mt-1 text-sm text-navy-200">
            <span className="italic">{venue}</span>. {details}.
          </p>
        </div>

        <div data-detail className="mt-6 flex flex-wrap gap-2">
          {doi && (
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${modalActionClassName} bg-accent-400 text-navy-950 hover:bg-accent-300`}
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              View DOI
            </a>
          )}
          <button
            ref={copyButtonRef}
            type="button"
            onClick={copy}
            className={`${modalActionClassName} border ${
              status === "copied"
                ? "border-accent-300 bg-accent-400/15 text-accent-200"
                : "border-white/20 hover:bg-white/10"
            }`}
          >
            <CopyIcon aria-hidden="true" className="size-4" />
            <span aria-live="polite">{copyLabel}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function Publications({
  publications,
  highlightAuthors,
  outputs,
}: PublicationsProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [details, setDetails] = useState<OpenDetails | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const searched = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = normalizedQuery
      ? publications.filter((publication) => matchesQuery(publication, normalizedQuery))
      : publications;
    return [...matching].sort(
      (a, b) => b.year - a.year || b.scopusCitations - a.scopusCitations,
    );
  }, [publications, query]);

  const visible = useMemo(
    () => searched.filter(({ type }) => typeFilter === "all" || type === typeFilter),
    [searched, typeFilter],
  );

  const countFor = (value: TypeFilter) =>
    value === "all" ? searched.length : searched.filter(({ type }) => type === value).length;

  // Only types on the page get a tab, and a single type leaves nothing to filter.
  const tabs = filterTabs.filter(
    ({ value }) => value === "all" || publications.some(({ type }) => type === value),
  );

  // Pushes the stage back while a tile is out in front of it.
  useEffect(() => {
    gsap.to(frameRef.current, {
      scale: details ? 0.9 : 1,
      opacity: details ? 0.3 : 1,
      duration: prefersReducedMotion() ? 0 : 0.6,
      ease: SMOOTH_EASE,
    });
  }, [details]);

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
  };

  const openDetails = (publication: Publication, opener: HTMLElement) => {
    const tile = opener.closest("article");
    if (tile) setDetails({ publication, origin: tile.getBoundingClientRect() });
  };

  return (
    // The negative margin cancels the page's scroll padding, so a link to this section
    // lands where the stage engages instead of just above it.
    <section
      id="publications"
      aria-labelledby="publications-title"
      className="relative -scroll-mt-20 bg-navy-950 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-blueprint mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      />

      <div className="publication-carousel">
        <HorizontalTrack
          label="Selected publications"
          ghostText="Publications"
          cardCount={visible.length}
          // A string, because a keystroke that keeps the same cards still builds a new array.
          cardsKey={visible.map(({ id }) => id).join()}
          frameRef={frameRef}
          stacked
          toolbar={
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {tabs.length > 2 && (
                <div role="group" aria-label="Filter by publication type" className="flex flex-wrap gap-1.5">
                  {tabs.map(({ value, label }) => {
                    const pressed = typeFilter === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={pressed}
                        onClick={() => setTypeFilter(value)}
                        className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                          pressed ? "text-navy-950" : "text-navy-200 hover:text-white"
                        }`}
                      >
                        {pressed && (
                          // Not a shared layoutId: Framer measures that against the page, so
                          // a filter restarting the scroll would fling the pill in from far off.
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            className="absolute inset-0 rounded-full bg-white"
                          />
                        )}
                        {value !== "all" && (
                          <span
                            aria-hidden="true"
                            style={{ backgroundColor: typeColors[value] }}
                            className="relative size-2 rounded-full"
                          />
                        )}
                        <span className="relative">{label}</span>
                        <span className="relative font-mono text-xs opacity-70">{countFor(value)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="relative w-full lg:ml-auto lg:max-w-xs">
                <label htmlFor="publication-search" className="sr-only">
                  Search publications by title, venue, or author
                </label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-accent-400"
                />
                <input
                  id="publication-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search publications"
                  className="w-full rounded-full border border-white/15 bg-navy-950 py-2 pl-9 pr-3 text-sm text-white transition-colors placeholder:text-navy-300 focus:border-accent-400/60"
                />
              </div>
            </div>
          }
        >
          <div data-stop className="pointer-events-auto w-(--track-intro) shrink-0 snap-center">
            <Reveal>
              <SectionHeading
                id="publications-title"
                eyebrow="Publications"
                title="Selected publications"
                description={`${publications.length} of the ${outputs.total} research outputs listed on the Monash University research profile, newest first. Each one opens to a ready-to-copy BibTeX citation.`}
                tone="dark"
              />
              <a
                href={outputs.allOutputsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-300 transition-colors hover:text-accent-200"
              >
                View all {outputs.total} research outputs
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
              {visible.length > 1 && (
                <p className="mt-6 font-mono text-xs text-accent-300">
                  <span className="lg:hidden">Swipe through the {visible.length} publications</span>
                  <span className="hidden lg:inline">
                    Keep scrolling through the {visible.length} publications
                  </span>
                </p>
              )}
            </Reveal>
          </div>

          {visible.length > 0 ? (
            // The padding gives the tiles room for their shadows and float, since the viewport clips.
            <ol className="flex items-center gap-(--track-gap) py-10 transform-3d">
              {visible.map((publication) => {
                const { id, title, authors, venue, year, type } = publication;
                return (
                  <li
                    key={id}
                    data-stop
                    className="flex w-(--track-card) shrink-0 snap-center justify-center transform-3d"
                  >
                    <article
                      style={{ "--tile-glow": `${typeColors[type]}55` } as CSSProperties}
                      className="glass-tile pointer-events-auto relative h-96 w-full shrink-0 overflow-hidden rounded-3xl lg:motion-safe:w-[min(38rem,calc(100vw-35rem))]"
                    >
                      <div aria-hidden="true" className="absolute inset-0 bg-navy-900" />

                      <div className="relative flex h-full flex-col p-6 sm:p-8">
                        <p>
                          <TypeBadge type={type} />
                        </p>

                        <h3 className="mt-4 line-clamp-3 text-pretty font-display text-2xl font-extrabold leading-tight tracking-tight">
                          {title}
                        </h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-navy-200">
                          <AuthorList
                            authors={authors}
                            highlightAuthors={highlightAuthors}
                            highlightClassName="font-bold text-white"
                          />
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm italic leading-6 text-navy-300">
                          {venue}, {year}
                        </p>

                        <button
                          type="button"
                          aria-haspopup="dialog"
                          onClick={(event) => openDetails(publication, event.currentTarget)}
                          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-400 px-4 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-accent-300"
                        >
                          <Sparkles aria-hidden="true" className="size-4" />
                          View Details &amp; BibTeX
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="pointer-events-auto w-(--track-card) shrink-0 snap-center text-center">
              <p className="font-semibold">No publications match your search.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-sm font-semibold text-accent-300 hover:text-accent-200"
              >
                Clear search and filters
              </button>
            </div>
          )}
        </HorizontalTrack>
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length > 0
          ? `Showing ${visible.length} of ${publications.length} publications`
          : "No publications match your search."}
      </p>

      {/* The track needs JavaScript, so this keeps the list readable without it. */}
      <noscript>
        <div className="page-container-wide py-20">
          <SectionHeading eyebrow="Publications" title="Selected publications" tone="dark" />
          <ul className="mt-10 max-w-3xl space-y-6">
            {searched.map(({ id, title, authors, venue, details, year }) => (
              <li key={id}>
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <p className="text-sm text-navy-200">
                  {authors.join(", ")}. {venue}, {year}. {details}.
                </p>
              </li>
            ))}
          </ul>
        </div>
      </noscript>

      {details && (
        <PublicationModal
          key={details.publication.id}
          publication={details.publication}
          highlightAuthors={highlightAuthors}
          origin={details.origin}
          onClose={() => setDetails(null)}
        />
      )}
    </section>
  );
}
