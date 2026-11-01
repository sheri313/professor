// ============================================================
// Professor Portfolio – Data Layer
//
// Everything below is fictional placeholder content. Mock DOIs use
// Crossref's reserved test prefix (10.5555) and mock arXiv IDs are
// out of range, so neither links to a real paper. Mock patent numbers
// are also out of range and do not match any issued patent.
//
// Optional asset fields (profileImage, cv, photo, pdfUrl) render their
// image or link only once they are set. Drop the files in public/ and
// point these fields at them. Course downloads in public/courses are
// placeholder PDFs, so replace them with the real documents.
// ============================================================
import {
  AtSign,
  BookOpen,
  BrainCircuit,
  Briefcase,
  ChartColumn,
  Cloud,
  FlaskConical,
  GitBranch,
  GraduationCap,
  MousePointerClick,
  Network,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// ─── Shared primitives ───────────────────────────────────────
export interface NavLink {
  label: string;
  href: `#${string}`;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: LucideIcon;
  featured?: boolean; // shown as a badge in the About quick facts
}

// ─── Professor bio / hero ────────────────────────────────────
export interface ProfessorProfile {
  name: string;
  citationName: string; // as printed on papers, highlighted in author lists
  title: string;
  headlineLead: string;
  headlineHighlight: string; // the gradient part of the hero headline
  tagline: string;
  department: string;
  university: string;
  location: string;
  labName: string;
  labRole: string;
  email: string;
  phone: string;
  officeHours: OfficeHourSlot[];
  officeLocation: string;
  officeAddress: string[];
  bio: string; // paragraphs separated by a blank line
  shortBio: string;
  contactNote: string;
  education: EducationEntry[];
  editorialBoards: EditorialRole[];
  keynotes: Keynote[];
  profileImage?: string;
  cv?: string;
  socials: SocialLink[];
  stats: Stat[];
}

export interface OfficeHourSlot {
  day: string;
  time: string;
  format: string;
}

// A key rather than an icon component, because stats cross into the client-side Hero.
export type StatIconName = "citations" | "hIndex" | "publications" | "graduates";

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: StatIconName;
}

// Only the fields Hero needs. Socials hold icon components, which can't cross into a client component.
export type HeroProfile = Pick<
  ProfessorProfile,
  | "name"
  | "title"
  | "university"
  | "labRole"
  | "headlineLead"
  | "headlineHighlight"
  | "tagline"
  | "profileImage"
  | "stats"
>;

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
}

export interface EditorialRole {
  role: string;
  venue: string;
  period: string;
}

export interface Keynote {
  title: string;
  event: string;
  location: string;
  year: number;
}

// ─── Recruitment ─────────────────────────────────────────────
export interface Recruitment {
  eyebrow: string;
  title: string;
  description: string;
  audiences: string[];
}

// ─── Research interests ──────────────────────────────────────
export interface ResearchInterest {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
}

// ─── Publications ────────────────────────────────────────────
export type PublicationType = "journal" | "conference" | "patent";

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: PublicationType;
  doi?: string;
  arxiv?: string;
  pdfUrl?: string;
  abstract: string;
  tags: string[];
  featured: boolean;
  citations: number;
  bibtex: string;
  award?: string;
}

// ─── Team / Lab members ──────────────────────────────────────
export type MemberRole = "PhD Candidate" | "Master's Student" | "Research Assistant" | "Alumni";

export interface TeamMember {
  id: string;
  name: string;
  role: MemberRole;
  photo?: string;
  researchArea: string;
  email: string;
  linkedin?: string;
  github?: string;
  personalSite?: string;
  year: number; // enrollment / join year
  graduated?: number;
  currentPosition?: string; // for alumni
  bio: string;
}

// ─── Teaching ────────────────────────────────────────────────
export type CourseLevel = "Undergraduate" | "Graduate";

export type Semester = "Fall" | "Spring" | "Summer";

export type CourseStatus = "current" | "past";

export interface CourseMaterial {
  label: string;
  href: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  level: CourseLevel;
  credits: number;
  description: string;
  semester: Semester;
  year: number;
  status: CourseStatus;
  syllabus?: string;
  materials?: CourseMaterial[];
  tags: string[];
}

// ─── News / Updates ──────────────────────────────────────────
export type NewsType = "award" | "publication" | "talk" | "grant" | "misc";

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  description: string;
  link?: string;
  type: NewsType;
}

// ============================================================
// DATA
// ============================================================

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Publications", href: "#publications" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "#contact" },
];

export const footerLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Publications", href: "#publications" },
  { label: "Team", href: "#team" },
  { label: "Teaching", href: "#teaching" },
  { label: "Contact", href: "#contact" },
];

export const professorProfile: ProfessorProfile = {
  name: "Dr. Eleanor A. Mitchell",
  citationName: "Eleanor A. Mitchell",
  title: "Lecturer & Researcher in Health Informatics & Systems",
  headlineLead: "Advancing the science of",
  headlineHighlight: "Software Engineering & AI",
  tagline:
    "Building software systems that are not only correct, but measurably trustworthy, explainable, and resilient.",
  department: "School of Rural Health / Department of Software & Systems Integration",
  university: "Monash University, Australia",
  location: "Australia",
  labName: "Dr. Eleanor A. Mitchell Lab",
  labRole: "Director, Software Intelligence Lab",
  email: "e.mitchell@monash.example",
  phone: "+1 (617) 555-0192",
  officeHours: [
    { day: "Tuesday", time: "2:00 PM – 4:00 PM", format: "In person" },
    { day: "Thursday", time: "2:00 PM – 4:00 PM", format: "In person" },
    { day: "Friday", time: "10:00 AM – 11:00 AM", format: "Online, by appointment" },
  ],
  officeLocation: "Gates Hall, Room 412",
  officeAddress: ["100 Westbrook Way", "Cambridge, MA 02139, USA"],
  bio: `Dr. Eleanor A. Mitchell is a Professor of Software Engineering at Monash University, where she directs the Software Intelligence Lab. Her research sits at the intersection of software engineering, human-computer interaction, and artificial intelligence — with a focus on building software systems that are not only functionally correct but measurably trustworthy, explainable, and resilient.

Before joining Monash, Dr. Mitchell was a Research Scientist at Google Brain (2013–2016) and a postdoctoral fellow at MIT CSAIL (2012–2013). She received her Ph.D. from Carnegie Mellon University in 2012, advised by Prof. Marcus J. Aldridge.

Dr. Mitchell has authored over 80 peer-reviewed papers, attracting more than 4,500 citations. Her work has been recognised with the ACM SIGSOFT Distinguished Paper Award (2022, 2024), an NSF CAREER Award (2018), and a Google Faculty Research Award (2021). She has served on the program committees of ICSE, FSE, SOSP, and NeurIPS, and regularly chairs workshops on trustworthy AI for software engineering. She serves on the editorial boards of IEEE Transactions on Software Engineering and Empirical Software Engineering, and is a frequent keynote speaker at major software engineering venues.

Beyond research, Dr. Mitchell is deeply committed to inclusive education in computing. She founded the WIT Women in Computing Mentoring Circle and is a co-PI on the NSF-funded broadening-participation project "Code Without Borders."`,

  shortBio: `Professor of Software Engineering at Monash University. Director of the Software Intelligence Lab. Research interests: AI code generation, distributed systems, cloud architecture, and empirical software engineering. NSF CAREER awardee. 80+ papers, 4,500+ citations.`,


  contactNote: `For research collaborations, speaking invitations, and media requests, email is the best way to reach me. Prospective students, please see the openings above before writing.`,

  education: [
    { degree: "Ph.D. in Computer Science", institution: "Carnegie Mellon University", year: 2012 },
    { degree: "M.S. in Computer Science", institution: "University of Michigan", year: 2008 },
    { degree: "B.S. in Computer Engineering", institution: "University of Waterloo", year: 2006 },
  ],

  editorialBoards: [
    {
      role: "Associate Editor",
      venue: "IEEE Transactions on Software Engineering",
      period: "2021–present",
    },
    {
      role: "Editorial Board Member",
      venue: "Empirical Software Engineering",
      period: "2019–present",
    },
    {
      role: "Review Board Member",
      venue: "ACM Transactions on Software Engineering and Methodology",
      period: "2018–2022",
    },
  ],

  keynotes: [
    {
      title: "Shipping AI-Generated Code Safely",
      event: "International Workshop on AI for Software Engineering",
      location: "Lisbon, Portugal",
      year: 2024,
    },
    {
      title: "The Reliability Gap in AI-Assisted Coding",
      event: "IEEE/ACM International Conference on Automated Software Engineering (ASE)",
      location: "Luxembourg",
      year: 2023,
    },
    {
      title: "Trust as a Software Quality Attribute",
      event: "ACM/IEEE Symposium on Empirical Software Engineering and Measurement (ESEM)",
      location: "Helsinki, Finland",
      year: 2022,
    },
  ],

  socials: [
    { platform: "Google Scholar", url: "https://scholar.google.com", icon: GraduationCap, featured: true },
    { platform: "ResearchGate", url: "https://www.researchgate.net", icon: FlaskConical, featured: true },
    { platform: "GitHub", url: "https://github.com", icon: GitBranch },
    { platform: "LinkedIn", url: "https://linkedin.com", icon: Briefcase },
    { platform: "Twitter / X", url: "https://x.com", icon: AtSign },
    { platform: "DBLP", url: "https://dblp.org", icon: BookOpen },
    { platform: "Semantic Scholar", url: "https://semanticscholar.org", icon: Search },
  ],

  stats: [
    { label: "Citations", value: 4500, suffix: "+", icon: "citations" },
    { label: "H-Index", value: 32, icon: "hIndex" },
    { label: "Publications", value: 80, suffix: "+", icon: "publications" },
    { label: "Graduated PhDs", value: 15, icon: "graduates" },
  ],
};

// ─── Recruitment ─────────────────────────────────────────────
export const recruitment: Recruitment = {
  eyebrow: "Now recruiting",
  title: "Open Positions",
  description:
    "Recruiting self-motivated students for Fall/Spring intakes. CSC Scholarship applicants are welcome to reach out with CV and transcripts.",
  audiences: ["Master's Applicants", "PhD Applicants", "CSC Scholarship Applicants"],
};

// ─── Research Interests ─────────────────────────────────────
export const researchInterests: ResearchInterest[] = [
  {
    id: "distributed-systems",
    title: "Distributed Systems",
    description:
      "Designing and validating large-scale distributed systems that stay reliable under failure, using automated fault injection, chaos experiments, and runtime verification.",
    icon: Network,
    tags: ["Fault Tolerance", "Chaos Engineering", "Consensus", "Observability"],
  },
  {
    id: "ai-code-generation",
    title: "AI Code Generation",
    description:
      "Auditing and improving LLM-generated code so it is correct, secure, and maintainable, combining program analysis with specification inference and automated repair.",
    icon: BrainCircuit,
    tags: ["LLMs", "Program Repair", "Static Analysis", "Specification Inference"],
  },
  {
    id: "cloud-architecture",
    title: "Cloud Architecture",
    description:
      "Patterns and tooling for cloud-native platforms, from microservice design to self-tuning CI/CD pipelines and safe deployment of machine learning systems.",
    icon: Cloud,
    tags: ["Microservices", "CI/CD", "MLOps", "Site Reliability"],
  },
  {
    id: "empirical-se",
    title: "Empirical Software Engineering",
    description:
      "Large-scale studies of repositories, issue trackers, and developer behavior that turn software evolution, technical debt, and team dynamics into actionable evidence.",
    icon: ChartColumn,
    tags: ["Repository Mining", "Technical Debt", "Controlled Experiments", "OSS Ecosystems"],
  },
  {
    id: "trustworthy-ai",
    title: "Trustworthy & Explainable AI",
    description:
      "Developing methods and tools that make AI-assisted software engineering decisions interpretable, auditable, and fair, so engineers can understand, verify, and trust AI outputs in safety-critical contexts.",
    icon: ShieldCheck,
    tags: ["XAI", "Fairness", "Safety", "LLM Auditing"],
  },
  {
    id: "hci-devtools",
    title: "Human-Centered Developer Tools",
    description:
      "Empirical studies of programmer cognition, collaborative coding, and the design of IDE plugins and AI pair-programming tools that augment human creativity rather than replace it.",
    icon: MousePointerClick,
    tags: ["IDE Design", "Code Review", "Pair Programming", "Cognitive Load"],
  },
];

// ─── Publications ────────────────────────────────────────────
export const publications: Publication[] = [
  {
    id: "pub-2024-01",
    title: "TrustLens: Auditing LLM-Generated Code for Safety and Correctness",
    authors: ["Eleanor A. Mitchell", "Ravi K. Sharma", "Yuna Takahashi", "Marcus J. Aldridge"],
    venue: "ACM International Conference on Software Engineering (ICSE)",
    year: 2024,
    type: "conference",
    doi: "10.5555/mock.trustlens.2024",
    arxiv: "2401.99901",
    abstract:
      "Large Language Models (LLMs) are increasingly used to generate production code, yet systematic auditing of their safety and correctness properties remains ad-hoc. We present TrustLens, a framework that combines lightweight static analysis with semantic similarity search to flag generated code snippets that violate programmer-specified invariants or introduce Common Weakness Enumeration (CWE) vulnerabilities. An evaluation on 12,000 LLM-generated functions shows TrustLens achieves 91.3% precision and 87.6% recall at a 4× speedup over manual review.",
    tags: ["LLM", "Code Generation", "Static Analysis", "Security"],
    featured: true,
    citations: 112,
    award: "ACM SIGSOFT Distinguished Paper Award",
    bibtex: `@inproceedings{mitchell2024trustlens,
  title     = {{TrustLens}: Auditing {LLM}-Generated Code for Safety and Correctness},
  author    = {Mitchell, Eleanor A. and Sharma, Ravi K. and Takahashi, Yuna and Aldridge, Marcus J.},
  booktitle = {Proceedings of the 46th International Conference on Software Engineering (ICSE)},
  year      = {2024},
  doi       = {10.5555/mock.trustlens.2024},
  pages     = {1--12},
  publisher = {ACM},
  address   = {Lisbon, Portugal}
}`,
  },
  {
    id: "pub-2023-02",
    title: "SpecInfer: Inferring Probabilistic Specifications from Neural Test Suites",
    authors: ["Yuna Takahashi", "Eleanor A. Mitchell", "Arjun Bose"],
    venue: "ACM Joint European Software Engineering Conference / Foundations of Software Engineering (ESEC/FSE)",
    year: 2023,
    type: "conference",
    doi: "10.5555/mock.specinfer.2023",
    arxiv: "2308.99902",
    abstract:
      "We introduce SpecInfer, a technique for mining probabilistic program specifications from neural-network-driven test generation. By analysing the distribution of test inputs produced by a learned model, SpecInfer constructs likely invariants expressed as probabilistic assertions. On 20 real-world Java projects, SpecInfer surfaces 73% of the manually curated invariants missed by Daikon, with a false-positive rate below 8%.",
    tags: ["Specification Inference", "Neural Testing", "Program Analysis"],
    featured: true,
    citations: 78,
    bibtex: `@inproceedings{takahashi2023specinfer,
  title     = {{SpecInfer}: Inferring Probabilistic Specifications from Neural Test Suites},
  author    = {Takahashi, Yuna and Mitchell, Eleanor A. and Bose, Arjun},
  booktitle = {Proceedings of the ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering (ESEC/FSE)},
  year      = {2023},
  doi       = {10.5555/mock.specinfer.2023},
  pages     = {234--246},
  publisher = {ACM},
  address   = {San Francisco, CA, USA}
}`,
  },
  {
    id: "pub-2023-03",
    title: "ChaosGuard: Automated Chaos Experiment Design for Microservice Reliability",
    authors: ["David Nwosu", "Eleanor A. Mitchell", "Priya Patel"],
    venue: "IEEE/ACM International Conference on Automated Software Engineering (ASE)",
    year: 2023,
    type: "conference",
    doi: "10.5555/mock.chaosguard.2023",
    abstract:
      "Chaos engineering validates system resilience by intentionally injecting faults, but designing effective experiments at scale remains a manual, expert-intensive activity. ChaosGuard uses service dependency graphs and historical incident reports to synthesise and prioritise chaos scenarios automatically. In a study with three production microservice systems (collectively handling 50 M+ requests/day), ChaosGuard surfaced 14 previously unknown failure modes within 24 hours of integration.",
    tags: ["Chaos Engineering", "Microservices", "Fault Injection", "Reliability"],
    featured: false,
    citations: 43,
    bibtex: `@inproceedings{nwosu2023chaosguard,
  title     = {{ChaosGuard}: Automated Chaos Experiment Design for Microservice Reliability},
  author    = {Nwosu, David and Mitchell, Eleanor A. and Patel, Priya},
  booktitle = {Proceedings of the 38th IEEE/ACM International Conference on Automated Software Engineering (ASE)},
  year      = {2023},
  doi       = {10.5555/mock.chaosguard.2023},
  pages     = {312--323},
  publisher = {IEEE},
  address   = {Kirchberg, Luxembourg}
}`,
  },
  {
    id: "pub-2022-01",
    title: "FairCode: Detecting and Mitigating Demographic Bias in Code-Completion Models",
    authors: ["Eleanor A. Mitchell", "Sofia Reyes", "Wei Zhang", "Lena Holm"],
    venue: "ACM International Conference on Software Engineering (ICSE)",
    year: 2022,
    type: "conference",
    doi: "10.5555/mock.faircode.2022",
    arxiv: "2112.99903",
    abstract:
      "Code-completion models trained on public repositories may perpetuate or amplify demographic biases embedded in variable names, comments, and API choices. FairCode provides a benchmark suite of 4,800 code snippets annotated for five bias dimensions, along with debiasing fine-tuning strategies. Our experiments show that targeted fine-tuning reduces bias scores by 62% while preserving completion accuracy within 2% of the baseline.",
    tags: ["Fairness", "Code Completion", "Bias", "ML for SE"],
    featured: true,
    citations: 201,
    award: "ACM SIGSOFT Distinguished Paper Award",
    bibtex: `@inproceedings{mitchell2022faircode,
  title     = {{FairCode}: Detecting and Mitigating Demographic Bias in Code-Completion Models},
  author    = {Mitchell, Eleanor A. and Reyes, Sofia and Zhang, Wei and Holm, Lena},
  booktitle = {Proceedings of the 44th International Conference on Software Engineering (ICSE)},
  year      = {2022},
  doi       = {10.5555/mock.faircode.2022},
  pages     = {879--890},
  publisher = {ACM},
  address   = {Pittsburgh, PA, USA}
}`,
  },
  {
    id: "pub-2021-01",
    title: "CognitiveCost: Measuring the Mental Overhead of Code Review at Scale",
    authors: ["Arjun Bose", "Eleanor A. Mitchell", "Tobias Renner"],
    venue: "Empirical Software Engineering (EMSE)",
    year: 2021,
    type: "journal",
    doi: "10.5555/mock.cognitivecost.2021",
    abstract:
      "Code review is a cornerstone of collaborative software development, yet its cognitive demands are rarely quantified. We instrumented GitHub pull-request workflows with eye-tracking and think-aloud protocols across 38 professional developers, producing the CognitiveCost dataset. Regression analysis reveals that cyclomatic complexity, reviewer expertise gap, and review latency are the strongest predictors of cognitive load, offering actionable guidance for tool designers.",
    tags: ["Code Review", "Cognitive Load", "HCI", "Empirical Study"],
    featured: false,
    citations: 134,
    bibtex: `@article{bose2021cognitivecost,
  title   = {{CognitiveCost}: Measuring the Mental Overhead of Code Review at Scale},
  author  = {Bose, Arjun and Mitchell, Eleanor A. and Renner, Tobias},
  journal = {Empirical Software Engineering},
  year    = {2021},
  volume  = {26},
  number  = {4},
  pages   = {1--42},
  doi     = {10.5555/mock.cognitivecost.2021},
  publisher = {Springer}
}`,
  },
  {
    id: "pub-2020-01",
    title: "TechDebtMap: Visualising and Prioritising Technical Debt in Large Codebases",
    authors: ["Eleanor A. Mitchell", "David Nwosu", "Kasimir Wolf"],
    venue: "ACM/IEEE International Symposium on Empirical Software Engineering and Measurement (ESEM)",
    year: 2020,
    type: "conference",
    doi: "10.5555/mock.techdebtmap.2020",
    abstract:
      "Managing technical debt in multi-million-line codebases requires prioritisation beyond simple heuristics. TechDebtMap combines static analysis, commit history mining, and developer surveys to generate interactive heat-maps that rank debt items by business impact and remediation cost. A controlled experiment with 5 industrial partners showed that TechDebtMap improved prioritisation accuracy by 38% compared to SonarQube defaults.",
    tags: ["Technical Debt", "Mining", "Visualisation", "Empirical"],
    featured: false,
    citations: 89,
    bibtex: `@inproceedings{mitchell2020techdebtmap,
  title     = {{TechDebtMap}: Visualising and Prioritising Technical Debt in Large Codebases},
  author    = {Mitchell, Eleanor A. and Nwosu, David and Wolf, Kasimir},
  booktitle = {Proceedings of the ACM/IEEE International Symposium on Empirical Software Engineering and Measurement (ESEM)},
  year      = {2020},
  doi       = {10.5555/mock.techdebtmap.2020},
  pages     = {1--11},
  publisher = {ACM},
  address   = {Bari, Italy}
}`,
  },
  {
    id: "pub-2019-01",
    title: "AdaptiveCI: Self-Tuning Continuous Integration Pipelines via Reinforcement Learning",
    authors: ["Priya Patel", "Eleanor A. Mitchell"],
    venue: "ACM/IEEE International Conference on Software Engineering (ICSE)",
    year: 2019,
    type: "conference",
    doi: "10.5555/mock.adaptiveci.2019",
    arxiv: "1902.99904",
    abstract:
      "Continuous integration pipelines waste significant developer time on unnecessary test runs. AdaptiveCI employs a contextual bandit to select which test subsets to execute based on code-change features, optimising for fault-detection rate under time constraints. Evaluated on four open-source projects, AdaptiveCI reduces test execution time by 54% while detecting 96.2% of faults caught by the full suite.",
    tags: ["CI/CD", "Reinforcement Learning", "Test Prioritisation", "Automation"],
    featured: false,
    citations: 167,
    bibtex: `@inproceedings{patel2019adaptiveci,
  title     = {{AdaptiveCI}: Self-Tuning Continuous Integration Pipelines via Reinforcement Learning},
  author    = {Patel, Priya and Mitchell, Eleanor A.},
  booktitle = {Proceedings of the 41st International Conference on Software Engineering (ICSE)},
  year      = {2019},
  doi       = {10.5555/mock.adaptiveci.2019},
  pages     = {544--555},
  publisher = {IEEE},
  address   = {Montreal, QC, Canada}
}`,
  },
  {
    id: "pub-2018-01",
    title: "Towards a Taxonomy of Explainability Techniques for Machine-Learned Bug Detectors",
    authors: ["Eleanor A. Mitchell", "Ravi K. Sharma"],
    venue: "IEEE Transactions on Software Engineering (TSE)",
    year: 2018,
    type: "journal",
    doi: "10.5555/mock.explainability.2018",
    abstract:
      "ML-based bug detectors achieve high accuracy but offer little insight into their decisions, limiting practitioner trust. We survey 47 explainability techniques across four families — feature attribution, concept-based, counterfactual, and example-based — and evaluate them against a taxonomy of eight developer-centric desiderata. Our findings surface critical gaps and motivate a new research agenda for explainable bug detection.",
    tags: ["XAI", "Bug Detection", "Explainability", "Survey"],
    featured: true,
    citations: 298,
    bibtex: `@article{mitchell2018taxonomy,
  title   = {Towards a Taxonomy of Explainability Techniques for Machine-Learned Bug Detectors},
  author  = {Mitchell, Eleanor A. and Sharma, Ravi K.},
  journal = {IEEE Transactions on Software Engineering},
  year    = {2018},
  volume  = {46},
  number  = {12},
  pages   = {1332--1358},
  doi     = {10.5555/mock.explainability.2018},
  publisher = {IEEE}
}`,
  },
  {
    id: "patent-2024-01",
    title: "Systems and Methods for Auditing Machine-Generated Source Code",
    authors: ["Eleanor A. Mitchell", "Ravi K. Sharma"],
    venue: "U.S. Patent 19,000,101 B2",
    year: 2024,
    type: "patent",
    abstract:
      "A system that checks machine-generated source code against programmer-specified invariants, flagging likely safety and correctness violations before the code is merged.",
    tags: ["LLM", "Code Generation", "Static Analysis"],
    featured: false,
    citations: 6,
    bibtex: `@misc{mitchell2024auditing,
  title        = {Systems and Methods for Auditing Machine-Generated Source Code},
  author       = {Mitchell, Eleanor A. and Sharma, Ravi K.},
  year         = {2024},
  howpublished = {U.S. Patent 19,000,101 B2},
  note         = {Assignee: Westbrook Institute of Technology}
}`,
  },
  {
    id: "patent-2023-01",
    title: "Automated Design of Fault-Injection Experiments for Distributed Services",
    authors: ["Eleanor A. Mitchell", "David Nwosu"],
    venue: "U.S. Patent 19,000,102 B2",
    year: 2023,
    type: "patent",
    abstract:
      "A method for generating and prioritising fault-injection experiments from service dependency graphs and historical incident reports.",
    tags: ["Chaos Engineering", "Microservices", "Reliability"],
    featured: false,
    citations: 4,
    bibtex: `@misc{mitchell2023faultinjection,
  title        = {Automated Design of Fault-Injection Experiments for Distributed Services},
  author       = {Mitchell, Eleanor A. and Nwosu, David},
  year         = {2023},
  howpublished = {U.S. Patent 19,000,102 B2},
  note         = {Assignee: Westbrook Institute of Technology}
}`,
  },
  {
    id: "patent-2021-01",
    title: "Adaptive Test Selection for Continuous Integration Pipelines",
    authors: ["Priya Patel", "Eleanor A. Mitchell"],
    venue: "U.S. Patent 19,000,103 B2",
    year: 2021,
    type: "patent",
    abstract:
      "A contextual bandit approach that selects which test subsets to run for a code change, reducing pipeline time while preserving fault detection.",
    tags: ["CI/CD", "Reinforcement Learning", "Test Prioritisation"],
    featured: false,
    citations: 9,
    bibtex: `@misc{patel2021testselection,
  title        = {Adaptive Test Selection for Continuous Integration Pipelines},
  author       = {Patel, Priya and Mitchell, Eleanor A.},
  year         = {2021},
  howpublished = {U.S. Patent 19,000,103 B2},
  note         = {Assignee: Westbrook Institute of Technology}
}`,
  },
];

// ─── Team Members ────────────────────────────────────────────
export const teamMembers: TeamMember[] = [
  {
    id: "ravi-sharma",
    name: "Ravi K. Sharma",
    role: "PhD Candidate",
    researchArea: "Trustworthy AI & LLM Code Auditing",
    email: "r.sharma@westbrook.example",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    personalSite: "https://example.com",
    year: 2021,
    bio: "Ravi is a 4th-year PhD student investigating interpretability and safety verification for LLM-generated code. He holds an M.Tech from IIT Bombay and previously interned at Microsoft Research and DeepMind.",
  },
  {
    id: "yuna-takahashi",
    name: "Yuna Takahashi",
    role: "PhD Candidate",
    researchArea: "Specification Inference & Program Analysis",
    email: "y.takahashi@westbrook.example",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    year: 2020,
    bio: "Yuna's research bridges formal methods and machine learning to infer probabilistic program specifications. She received her B.S. from Kyoto University and won the NSF Graduate Research Fellowship in 2021.",
  },
  {
    id: "david-nwosu",
    name: "David Nwosu",
    role: "PhD Candidate",
    researchArea: "Software Reliability & Chaos Engineering",
    email: "d.nwosu@westbrook.example",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    year: 2021,
    bio: "David focuses on automated chaos experiment design for cloud-native systems. Before his PhD, he was a Site Reliability Engineer at Stripe, where he developed deep expertise in distributed system failure modes.",
  },
  {
    id: "arjun-bose",
    name: "Arjun Bose",
    role: "PhD Candidate",
    researchArea: "Human-Centered Developer Tools & Code Review",
    email: "a.bose@westbrook.example",
    github: "https://github.com",
    personalSite: "https://example.com",
    year: 2019,
    bio: "Arjun studies the cognitive dimensions of software development, with a focus on code review and pair programming. His interdisciplinary background spans CS and cognitive science.",
  },
  {
    id: "sofia-reyes",
    name: "Sofia Reyes",
    role: "PhD Candidate",
    researchArea: "Fairness & Bias in ML-for-SE",
    email: "s.reyes@westbrook.example",
    linkedin: "https://linkedin.com",
    year: 2022,
    bio: "Sofia investigates demographic bias in AI-assisted coding tools. She is a NSF GRFP Fellow and holds a B.S. in CS and Gender Studies from the University of Michigan.",
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    role: "Research Assistant",
    researchArea: "CI/CD Automation & Software Testing",
    email: "p.patel@westbrook.example",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    personalSite: "https://example.com",
    year: 2023,
    bio: "Priya holds an MSc from ETH Zürich, where she studied reinforcement learning for test optimisation. She is now a research assistant at the Software Intelligence Lab, supporting the NSF-funded project on adaptive CI/CD pipelines.",
  },
  {
    id: "wei-zhang",
    name: "Wei Zhang",
    role: "Master's Student",
    researchArea: "Mining Software Repositories",
    email: "w.zhang@westbrook.example",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    year: 2023,
    bio: "Wei is an MSc student analysing the evolution of open-source AI frameworks using large-scale repository mining. He holds a B.Eng. from Tsinghua University.",
  },
  {
    id: "mateo-ruiz",
    name: "Mateo Ruiz",
    role: "Master's Student",
    researchArea: "Empirical Studies of AI Pair Programming",
    email: "m.ruiz@westbrook.example",
    linkedin: "https://linkedin.com",
    personalSite: "https://example.com",
    year: 2024,
    bio: "Mateo studies how professional developers review and adapt suggestions from AI pair-programming tools.",
  },
  {
    id: "amara-okafor",
    name: "Amara Okafor",
    role: "Research Assistant",
    researchArea: "Cloud Observability & Incident Analysis",
    email: "a.okafor@westbrook.example",
    linkedin: "https://linkedin.com",
    personalSite: "https://example.com",
    year: 2024,
    bio: "Amara builds tooling for analysing incident reports and telemetry from large cloud platforms.",
  },
  {
    id: "lena-holm",
    name: "Lena Holm",
    role: "Alumni",
    researchArea: "Fairness in SE",
    email: "lena.holm@westbrook.example",
    linkedin: "https://linkedin.com",
    year: 2019,
    graduated: 2024,
    currentPosition: "Research Scientist, Fairness Team, Meta AI",
    bio: "Lena completed her PhD on fairness measurement in software engineering tools. She received the Best Dissertation Award from the WIT CS Department and joined Meta AI as a Research Scientist.",
  },
];

// ─── Courses ─────────────────────────────────────────────────
export const courses: Course[] = [
  {
    id: "cs301",
    code: "CS 301",
    title: "Software Engineering Principles",
    level: "Undergraduate",
    credits: 4,
    description:
      "A rigorous introduction to the principles and practices of modern software engineering. Topics include requirements engineering, agile methodologies, design patterns, testing, version control, CI/CD, and software project management. Students complete a semester-long team project shipping a full-stack web application.",
    semester: "Fall",
    year: 2026,
    status: "current",
    syllabus: "/courses/cs301-syllabus.pdf",
    materials: [{ label: "Lecture Slides", href: "/courses/cs301-lecture-slides.pdf" }],
    tags: ["Agile", "Design Patterns", "Testing", "CI/CD"],
  },
  {
    id: "cs480",
    code: "CS 480",
    title: "Automated Software Testing",
    level: "Undergraduate",
    credits: 3,
    description:
      "Comprehensive coverage of software testing theory and practice: unit, integration, system, regression, fuzzing, property-based testing, and mutation testing. Emphasises tool-supported workflows and test automation infrastructure. Guest lectures from industry practitioners.",
    semester: "Spring",
    year: 2026,
    status: "past",
    syllabus: "/courses/cs480-syllabus.pdf",
    materials: [{ label: "Lecture Notes", href: "/courses/cs480-lecture-notes.pdf" }],
    tags: ["Unit Testing", "Fuzzing", "Mutation Testing", "Test Automation"],
  },
  {
    id: "cs601",
    code: "CS 601",
    title: "Advanced Topics in Software Engineering",
    level: "Graduate",
    credits: 3,
    description:
      "A reading-and-discussion seminar covering landmark and state-of-the-art papers in software engineering research. Topics rotate annually; 2026–27 focus: AI-assisted software development, with sub-topics on code generation, program repair, and developer productivity measurement.",
    semester: "Fall",
    year: 2026,
    status: "current",
    syllabus: "/courses/cs601-syllabus.pdf",
    materials: [{ label: "Reading List", href: "/courses/cs601-reading-list.pdf" }],
    tags: ["Research Seminar", "AI for SE", "Paper Reading", "Graduate"],
  },
  {
    id: "cs680",
    code: "CS 680",
    title: "Software Reliability Engineering",
    level: "Graduate",
    credits: 3,
    description:
      "Graduate-level treatment of reliability theory applied to software systems: reliability growth models, fault-tolerance architectures, chaos engineering, SLO/SLA design, on-call practices, and post-mortem analysis. Case studies drawn from Google, Netflix, and Amazon SRE books.",
    semester: "Spring",
    year: 2026,
    status: "past",
    syllabus: "/courses/cs680-syllabus.pdf",
    materials: [{ label: "Lecture Slides", href: "/courses/cs680-lecture-slides.pdf" }],
    tags: ["SRE", "Chaos Engineering", "Fault Tolerance", "Distributed Systems"],
  },
  {
    id: "cs690",
    code: "CS 690",
    title: "Human-Computer Interaction for Developers",
    level: "Graduate",
    credits: 3,
    description:
      "An interdisciplinary graduate course examining how software developers interact with their tools, teammates, and code. Topics: programmer cognition, IDE design, code comprehension, collaborative development, and inclusive design of developer tools. Students conduct an original empirical study.",
    semester: "Spring",
    year: 2025,
    status: "past",
    syllabus: "/courses/cs690-syllabus.pdf",
    materials: [{ label: "Study Guide", href: "/courses/cs690-study-guide.pdf" }],
    tags: ["HCI", "IDE Design", "Empirical Study", "Developer Experience"],
  },
];

// ─── News / Updates ──────────────────────────────────────────
export const newsItems: NewsItem[] = [
  {
    id: "news-2024-05",
    date: "May 2024",
    title: "TrustLens wins ACM SIGSOFT Distinguished Paper Award at ICSE 2024",
    description:
      "Our paper on auditing LLM-generated code for safety and correctness received the Distinguished Paper Award at the 46th ICSE in Lisbon, Portugal.",
    type: "award",
  },
  {
    id: "news-2024-03",
    date: "March 2024",
    title: "NSF Award: $1.2M for Trustworthy AI in Mission-Critical SE",
    description:
      "Dr. Mitchell is PI on a new 3-year NSF grant to develop verification and explainability frameworks for AI-generated software in safety-critical domains.",
    type: "grant",
  },
  {
    id: "news-2023-11",
    date: "November 2023",
    title: "Keynote at ASE 2023: “The Reliability Gap in AI-Assisted Coding”",
    description:
      "Dr. Mitchell delivered the opening keynote at the 38th IEEE/ACM International Conference on Automated Software Engineering in Luxembourg.",
    type: "talk",
  },
  {
    id: "news-2023-08",
    date: "August 2023",
    title: "SpecInfer accepted at ESEC/FSE 2023",
    description:
      "Our paper on inferring probabilistic specifications from neural test suites has been accepted at the ACM Joint ESEC/FSE 2023.",
    type: "publication",
  },
  {
    id: "news-2022-04",
    date: "April 2022",
    title: "FairCode wins ACM SIGSOFT Distinguished Paper Award at ICSE 2022",
    description:
      "FairCode, our work on detecting demographic bias in code-completion models, received the ACM SIGSOFT Distinguished Paper Award at ICSE 2022.",
    type: "award",
  },
  {
    id: "news-2021-09",
    date: "September 2021",
    title: "Google Faculty Research Award",
    description:
      "Dr. Mitchell received a Google Faculty Research Award for the project “Explainable and Auditable AI for Software Quality Assurance.”",
    type: "award",
  },
];
