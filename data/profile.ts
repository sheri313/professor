// ============================================================
// Site Data Layer
//
// Every fact on the site comes from content/profile.json, which records a source
// URL for each section. This file only adds types, navigation, icons, and values
// worked out from that data, such as the stats.
//
// person.photo renders only once it is set. Until then the site shows an initials
// placeholder. Open items are listed under "todo" in content/profile.json.
// ============================================================
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  HeartPulse,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import content from "@/content/profile.json";

const { biography, meta, person, projects: projectData, research, researchOutputs } = content;

// ─── Shared primitives ───────────────────────────────────────
export interface NavLink {
  label: string;
  href: `#${string}`;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: LucideIcon;
}

// ─── Profile / hero ──────────────────────────────────────────
export interface Profile {
  name: string;
  citationNames: string[]; // as printed on papers, highlighted in author lists
  title: string;
  headlineLead: string;
  headlineHighlight: string; // the gradient part of the hero headline
  tagline: string;
  department: string;
  university: string;
  email: string;
  bio: string;
  shortBio: string;
  contactNote: string;
  profileImage?: string;
  socials: SocialLink[];
  stats: Stat[];
}

// A key rather than an icon component, because stats cross into the client-side Hero.
export type StatIconName = "outputs" | "articles" | "projects" | "activeProjects";

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: StatIconName;
}

// Only the fields Hero needs. Socials hold icon components, which can't cross into a client component.
export type HeroProfile = Pick<
  Profile,
  | "name"
  | "university"
  | "headlineLead"
  | "headlineHighlight"
  | "tagline"
  | "profileImage"
  | "stats"
> & { badge: string };

// ─── Supervision ─────────────────────────────────────────────
export interface Supervision {
  status: string;
  statement: string;
  levels: string[];
  phdProjectsUrl: string;
}

// ─── Research interests ──────────────────────────────────────
export interface ResearchInterest {
  id: string;
  text: string; // verbatim from the profile, so don't reword it
  icon: LucideIcon;
}

// ─── Projects ────────────────────────────────────────────────
export interface Project {
  title: string;
  role: string;
  period: string;
  status: string;
}

export interface ProjectList {
  total: number;
  allProjectsUrl: string;
  items: Project[];
}

// ─── Publications ────────────────────────────────────────────
// The research output types the Monash profile counts.
export type PublicationType =
  | "article"
  | "review"
  | "letter"
  | "comment"
  | "conference"
  | "abstract"
  | "report";

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  details: string; // volume, issue, and pages
  year: number;
  type: PublicationType;
  doi?: string;
  url: string;
  scopusCitations: number;
  bibtex: string;
}

export interface ResearchOutputSummary {
  total: number;
  allOutputsUrl: string;
}

// ============================================================
// DATA
// ============================================================

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Supervision", href: "#supervision" },
  { label: "Publications", href: "#publications" },
  { label: "Contact", href: "#contact" },
];

const [firstName, lastName] = person.name.split(" ");
const name = `${person.honorific} ${firstName} ${lastName}`;
const title = `${person.position}, ${person.school}`;
const tagline = `${title}, ${person.university}`;

const totalOutputs = researchOutputs.byType.reduce((total, { count }) => total + count, 0);
const articleCount = researchOutputs.byType.find(({ label }) => label === "Article")?.count ?? 0;
const totalProjects = projectData.active + projectData.finished;

export const profile: Profile = {
  name,
  citationNames: person.citationNames,
  title,
  headlineLead: `${person.honorific} ${firstName}`,
  headlineHighlight: lastName,
  tagline,
  department: person.school,
  university: person.university,
  email: person.email,
  profileImage: person.photo ?? undefined,
  bio: biography.paragraphs[0],
  shortBio: `${tagline}. ${biography.paragraphs[0]}`,
  contactNote: "These contact details are as listed on the Monash University research profile.",
  socials: [
    { platform: "Monash profile", url: person.links.monash, icon: GraduationCap },
    { platform: "ORCID", url: person.links.orcid, icon: UserRound },
    { platform: "Scopus", url: person.links.scopus, icon: BookOpen },
  ],
  stats: [
    { label: "Research outputs", value: totalOutputs, icon: "outputs" },
    { label: "Research projects", value: totalProjects, icon: "projects" },
    { label: "Journal articles", value: articleCount, icon: "articles" },
    { label: "Active projects", value: projectData.active, icon: "activeProjects" },
  ],
};

export const supervision: Supervision = content.supervision;

const researchIcons: Record<string, LucideIcon> = {
  "rural-indigenous-health": HeartPulse,
  "primary-population-health": Stethoscope,
  "program-evaluation": ClipboardCheck,
  "health-education": Activity,
};

export const researchInterests: ResearchInterest[] = research.interests.map(({ id, text }) => ({
  id,
  text,
  icon: researchIcons[id],
}));

export const researchKeywords: string[] = research.keywords;

export const projects: ProjectList = {
  total: totalProjects,
  allProjectsUrl: projectData.allProjectsUrl,
  items: projectData.items,
};

export const publications = content.publications as Publication[];

export const researchOutputSummary: ResearchOutputSummary = {
  total: totalOutputs,
  allOutputsUrl: researchOutputs.allOutputsUrl,
};

export const lastUpdated = {
  iso: meta.lastUpdated,
  label: new Intl.DateTimeFormat("en-AU", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(meta.lastUpdated),
  ),
};

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  honorificPrefix: person.honorific,
  jobTitle: person.position,
  description: biography.paragraphs[0],
  email: `mailto:${person.email}`,
  affiliation: {
    "@type": "Organization",
    name: person.school,
    parentOrganization: { "@type": "CollegeOrUniversity", name: person.university },
  },
  knowsAbout: research.interests.map(({ text }) => text),
  sameAs: Object.values(person.links),
};
