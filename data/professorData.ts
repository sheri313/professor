// ============================================================
// Professor Portfolio – Data Layer
// ============================================================

// ─── Shared primitives ───────────────────────────────────────
export interface SocialLink {
  platform: string;
  url: string;
  icon: string; // lucide icon name key
}

// ─── Professor bio / hero ────────────────────────────────────
export interface ProfessorProfile {
  name: string;
  title: string;
  department: string;
  university: string;
  location: string;
  email: string;
  phone: string;
  officeHours: string;
  officeLocation: string;
  bio: string;
  shortBio: string;
  profileImage: string;
  cv: string;
  socials: SocialLink[];
  stats: Stat[];
}

export interface Stat {
  label: string;
  value: string;
  icon: string;
}

// ─── Research interests ──────────────────────────────────────
export interface ResearchInterest {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  color: string; // Tailwind bg class
}

// ─── Publications ────────────────────────────────────────────
export type PublicationType =
  | "journal"
  | "conference"
  | "workshop"
  | "book-chapter"
  | "preprint";

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
export type MemberRole =
  | "PhD Student"
  | "MSc Student"
  | "Postdoctoral Researcher"
  | "Research Scientist"
  | "Undergraduate Researcher"
  | "Alumni";

export interface TeamMember {
  id: string;
  name: string;
  role: MemberRole;
  photo: string;
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
export interface Course {
  id: string;
  code: string;
  title: string;
  level: "Undergraduate" | "Graduate";
  credits: number;
  description: string;
  semester: string;
  year: number;
  syllabus?: string;
  tags: string[];
}

// ─── News / Updates ──────────────────────────────────────────
export interface NewsItem {
  id: string;
  date: string;
  title: string;
  description: string;
  link?: string;
  type: "award" | "publication" | "talk" | "grant" | "misc";
}

// ============================================================
// DATA
// ============================================================

export const professorProfile: ProfessorProfile = {
  name: "Dr. Eleanor A. Mitchell",
  title: "Professor of Software Engineering & Human-Computer Interaction",
  department: "Department of Computer Science & Engineering",
  university: "Westbrook Institute of Technology",
  location: "Cambridge, MA, USA",
  email: "e.mitchell@westbrook.edu",
  phone: "+1 (617) 555-0192",
  officeHours: "Tuesdays & Thursdays, 2:00 PM – 4:00 PM",
  officeLocation: "Gates Hall, Room 412",
  bio: `Dr. Eleanor A. Mitchell is a Professor of Software Engineering at the Westbrook Institute of Technology, where she leads the SERAS Lab (Software Engineering, Reliability, and Adaptive Systems). Her research sits at the intersection of software engineering, human-computer interaction, and artificial intelligence — with a focus on building software systems that are not only functionally correct but measurably trustworthy, explainable, and resilient.

Before joining Westbrook, Dr. Mitchell was a Research Scientist at Google Brain (2013–2016) and a postdoctoral fellow at MIT CSAIL (2012–2013). She received her Ph.D. from Carnegie Mellon University in 2012, advised by Prof. James D. Herbsleb.

Dr. Mitchell has authored over 90 peer-reviewed papers, attracting more than 8,400 citations. Her work has been recognised with the ACM SIGSOFT Distinguished Paper Award (2019, 2022), an NSF CAREER Award (2018), and a Google Faculty Research Award (2021). She has served on the program committees of ICSE, FSE, SOSP, and NeurIPS, and regularly chairs workshops on trustworthy AI for software engineering.

Beyond research, Dr. Mitchell is deeply committed to inclusive education in computing. She founded the WIT Women in Computing Mentoring Circle and is a co-PI on the NSF-funded broadening-participation project "Code Without Borders."`,

  shortBio: `Professor of Software Engineering at Westbrook Institute of Technology. Leading the SERAS Lab. Research interests: trustworthy AI, program analysis, software reliability, and HCI. NSF CAREER awardee. 90+ papers, 8,400+ citations.`,

  profileImage: "/images/professor.jpg",
  cv: "/files/mitchell-cv.pdf",

  socials: [
    { platform: "Google Scholar", url: "https://scholar.google.com", icon: "GraduationCap" },
    { platform: "GitHub", url: "https://github.com", icon: "Github" },
    { platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
    { platform: "Twitter / X", url: "https://x.com", icon: "Twitter" },
    { platform: "DBLP", url: "https://dblp.org", icon: "BookOpen" },
    { platform: "Semantic Scholar", url: "https://semanticscholar.org", icon: "Search" },
  ],

  stats: [
    { label: "Publications", value: "90+", icon: "FileText" },
    { label: "Citations", value: "8,400+", icon: "Quote" },
    { label: "h-index", value: "42", icon: "TrendingUp" },
    { label: "Years Active", value: "15+", icon: "Clock" },
    { label: "PhD Students", value: "12", icon: "Users" },
    { label: "Research Grants", value: "$4.2M", icon: "DollarSign" },
  ],
};

// ─── Research Interests ─────────────────────────────────────
export const researchInterests: ResearchInterest[] = [
  {
    id: "trustworthy-ai",
    title: "Trustworthy & Explainable AI",
    description:
      "Developing methods and tools that make AI-assisted software engineering decisions interpretable, auditable, and fair — enabling engineers to understand, verify, and trust AI outputs in safety-critical contexts.",
    icon: "ShieldCheck",
    tags: ["XAI", "Fairness", "Safety", "LLM Auditing"],
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "program-analysis",
    title: "Automated Program Analysis",
    description:
      "Static and dynamic program analysis techniques for bug detection, vulnerability discovery, and automated repair. Current focus: LLM-guided symbolic execution and specification inference.",
    icon: "Code2",
    tags: ["Static Analysis", "Symbolic Execution", "Bug Repair", "Fuzzing"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "software-reliability",
    title: "Software Reliability Engineering",
    description:
      "Systematic approaches to measuring, predicting, and improving the reliability of large-scale distributed systems. Includes chaos engineering, fault injection, and runtime monitoring.",
    icon: "Activity",
    tags: ["Chaos Engineering", "Fault Tolerance", "SRE", "Observability"],
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "hci-devtools",
    title: "Human-Centered Developer Tools",
    description:
      "Empirical studies of programmer cognition, collaborative coding, and the design of IDE plugins and AI-pair-programming tools that augment — not replace — human creativity.",
    icon: "MousePointerClick",
    tags: ["IDE Design", "Code Review", "Pair Programming", "Cognitive Load"],
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "mse",
    title: "Mining Software Repositories",
    description:
      "Large-scale empirical analysis of code repositories, issue trackers, and communication channels to uncover actionable insights about software evolution, technical debt, and team dynamics.",
    icon: "BarChart3",
    tags: ["GitHub Mining", "NLP", "Technical Debt", "OSS Ecosystems"],
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "se4ml",
    title: "Software Engineering for ML Systems",
    description:
      "Adapting classical SE practices — testing, versioning, CI/CD — to the unique challenges of ML pipelines: data drift, model degradation, reproducibility, and deployment safety.",
    icon: "BrainCircuit",
    tags: ["MLOps", "Model Testing", "Data Versioning", "ML Pipelines"],
    color: "from-cyan-500 to-sky-600",
  },
];

// ─── Publications ────────────────────────────────────────────
export const publications: Publication[] = [
  {
    id: "pub-2024-01",
    title: "TrustLens: Auditing LLM-Generated Code for Safety and Correctness",
    authors: ["Eleanor A. Mitchell", "Ravi K. Sharma", "Yuna Takahashi", "James D. Herbsleb"],
    venue: "ACM International Conference on Software Engineering (ICSE)",
    year: 2024,
    type: "conference",
    doi: "10.1145/3597503.3623309",
    arxiv: "2401.12345",
    pdfUrl: "/papers/trustlens-icse2024.pdf",
    abstract:
      "Large Language Models (LLMs) are increasingly used to generate production code, yet systematic auditing of their safety and correctness properties remains ad-hoc. We present TrustLens, a framework that combines lightweight static analysis with semantic similarity search to flag generated code snippets that violate programmer-specified invariants or introduce Common Weakness Enumeration (CWE) vulnerabilities. An evaluation on 12,000 LLM-generated functions shows TrustLens achieves 91.3% precision and 87.6% recall at a 4× speedup over manual review.",
    tags: ["LLM", "Code Generation", "Static Analysis", "Security"],
    featured: true,
    citations: 112,
    award: "ACM SIGSOFT Distinguished Paper Award",
    bibtex: `@inproceedings{mitchell2024trustlens,
  title     = {{TrustLens}: Auditing {LLM}-Generated Code for Safety and Correctness},
  author    = {Mitchell, Eleanor A. and Sharma, Ravi K. and Takahashi, Yuna and Herbsleb, James D.},
  booktitle = {Proceedings of the 46th International Conference on Software Engineering (ICSE)},
  year      = {2024},
  doi       = {10.1145/3597503.3623309},
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
    doi: "10.1145/3611643.3613876",
    arxiv: "2308.04511",
    pdfUrl: "/papers/specinfer-fse2023.pdf",
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
  doi       = {10.1145/3611643.3613876},
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
    doi: "10.1109/ASE56229.2023.00041",
    pdfUrl: "/papers/chaosguard-ase2023.pdf",
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
  doi       = {10.1109/ASE56229.2023.00041},
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
    doi: "10.1145/3510003.3510042",
    arxiv: "2112.09876",
    pdfUrl: "/papers/faircode-icse2022.pdf",
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
  doi       = {10.1145/3510003.3510042},
  pages     = {879--890},
  publisher = {ACM},
  address   = {Pittsburgh, PA, USA}
}`,
  },
  {
    id: "pub-2021-01",
    title: "CognitiveCost: Measuring the Mental Overhead of Code Review at Scale",
    authors: ["Arjun Bose", "Eleanor A. Mitchell", "Thomas Zimmermann"],
    venue: "Empirical Software Engineering (EMSE)",
    year: 2021,
    type: "journal",
    doi: "10.1007/s10664-021-09975-5",
    pdfUrl: "/papers/cognitivecost-emse2021.pdf",
    abstract:
      "Code review is a cornerstone of collaborative software development, yet its cognitive demands are rarely quantified. We instrumented GitHub pull-request workflows with eye-tracking and think-aloud protocols across 38 professional developers, producing the CognitiveCost dataset. Regression analysis reveals that cyclomatic complexity, reviewer expertise gap, and review latency are the strongest predictors of cognitive load, offering actionable guidance for tool designers.",
    tags: ["Code Review", "Cognitive Load", "HCI", "Empirical Study"],
    featured: false,
    citations: 134,
    bibtex: `@article{bose2021cognitivecost,
  title   = {{CognitiveCost}: Measuring the Mental Overhead of Code Review at Scale},
  author  = {Bose, Arjun and Mitchell, Eleanor A. and Zimmermann, Thomas},
  journal = {Empirical Software Engineering},
  year    = {2021},
  volume  = {26},
  number  = {4},
  pages   = {1--42},
  doi     = {10.1007/s10664-021-09975-5},
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
    doi: "10.1145/3382494.3410677",
    pdfUrl: "/papers/techdebtmap-esem2020.pdf",
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
  doi       = {10.1145/3382494.3410677},
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
    doi: "10.1109/ICSE.2019.00056",
    arxiv: "1902.07624",
    pdfUrl: "/papers/adaptiveci-icse2019.pdf",
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
  doi       = {10.1109/ICSE.2019.00056},
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
    doi: "10.1109/TSE.2018.2854302",
    pdfUrl: "/papers/explainability-taxonomy-tse2018.pdf",
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
  doi     = {10.1109/TSE.2018.2854302},
  publisher = {IEEE}
}`,
  },
];

// ─── Team Members ────────────────────────────────────────────
export const teamMembers: TeamMember[] = [
  {
    id: "ravi-sharma",
    name: "Ravi K. Sharma",
    role: "PhD Student",
    photo: "/images/team/ravi.jpg",
    researchArea: "Trustworthy AI & LLM Code Auditing",
    email: "r.sharma@westbrook.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    personalSite: "https://ravikumar.dev",
    year: 2021,
    bio: "Ravi is a 4th-year PhD student investigating interpretability and safety verification for LLM-generated code. He holds an M.Tech from IIT Bombay and previously interned at Microsoft Research and DeepMind.",
  },
  {
    id: "yuna-takahashi",
    name: "Yuna Takahashi",
    role: "PhD Student",
    photo: "/images/team/yuna.jpg",
    researchArea: "Specification Inference & Program Analysis",
    email: "y.takahashi@westbrook.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    year: 2020,
    bio: "Yuna's research bridges formal methods and machine learning to infer probabilistic program specifications. She received her B.S. from Kyoto University and won the NSF Graduate Research Fellowship in 2021.",
  },
  {
    id: "david-nwosu",
    name: "David Nwosu",
    role: "PhD Student",
    photo: "/images/team/david.jpg",
    researchArea: "Software Reliability & Chaos Engineering",
    email: "d.nwosu@westbrook.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    year: 2021,
    bio: "David focuses on automated chaos experiment design for cloud-native systems. Before his PhD, he was a Site Reliability Engineer at Stripe, where he developed deep expertise in distributed system failure modes.",
  },
  {
    id: "arjun-bose",
    name: "Arjun Bose",
    role: "PhD Student",
    photo: "/images/team/arjun.jpg",
    researchArea: "Human-Centered Developer Tools & Code Review",
    email: "a.bose@westbrook.edu",
    github: "https://github.com",
    personalSite: "https://arjunbose.io",
    year: 2019,
    bio: "Arjun studies the cognitive dimensions of software development, with a focus on code review and pair programming. His interdisciplinary background spans CS and cognitive science.",
  },
  {
    id: "sofia-reyes",
    name: "Sofia Reyes",
    role: "PhD Student",
    photo: "/images/team/sofia.jpg",
    researchArea: "Fairness & Bias in ML-for-SE",
    email: "s.reyes@westbrook.edu",
    linkedin: "https://linkedin.com",
    year: 2022,
    bio: "Sofia investigates demographic bias in AI-assisted coding tools. She is a NSF GRFP Fellow and holds a B.S. in CS and Gender Studies from the University of Michigan.",
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    role: "Postdoctoral Researcher",
    photo: "/images/team/priya.jpg",
    researchArea: "CI/CD Automation & Software Testing",
    email: "p.patel@westbrook.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    personalSite: "https://priyapatel.net",
    year: 2023,
    bio: "Priya completed her PhD at ETH Zürich on reinforcement learning for test optimisation. She is now a postdoctoral researcher at SERAS Lab, leading the NSF-funded project on adaptive CI/CD pipelines.",
  },
  {
    id: "wei-zhang",
    name: "Wei Zhang",
    role: "MSc Student",
    photo: "/images/team/wei.jpg",
    researchArea: "Mining Software Repositories",
    email: "w.zhang@westbrook.edu",
    github: "https://github.com",
    year: 2023,
    bio: "Wei is an MSc student analysing the evolution of open-source AI frameworks using large-scale repository mining. He holds a B.Eng. from Tsinghua University.",
  },
  {
    id: "lena-holm",
    name: "Lena Holm",
    role: "Alumni",
    photo: "/images/team/lena.jpg",
    researchArea: "Fairness in SE",
    email: "lena.holm@acm.org",
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
    year: 2024,
    syllabus: "/syllabi/cs301-fall2024.pdf",
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
    year: 2025,
    syllabus: "/syllabi/cs480-spring2025.pdf",
    tags: ["Unit Testing", "Fuzzing", "Mutation Testing", "Test Automation"],
  },
  {
    id: "cs601",
    code: "CS 601",
    title: "Advanced Topics in Software Engineering",
    level: "Graduate",
    credits: 3,
    description:
      "A reading-and-discussion seminar covering landmark and state-of-the-art papers in software engineering research. Topics rotate annually; 2024–25 focus: AI-assisted software development, with sub-topics on code generation, program repair, and developer productivity measurement.",
    semester: "Fall",
    year: 2024,
    syllabus: "/syllabi/cs601-fall2024.pdf",
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
    year: 2025,
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
    year: 2024,
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
    title: "Keynote at ASE 2023: "The Reliability Gap in AI-Assisted Coding"",
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
    title: "FairCode wins Best Paper at ICSE 2022",
    description:
      "FairCode, our work on detecting demographic bias in code-completion models, received the ACM SIGSOFT Distinguished Paper Award at ICSE 2022.",
    type: "award",
  },
  {
    id: "news-2021-09",
    date: "September 2021",
    title: "Google Faculty Research Award",
    description:
      "Dr. Mitchell received a Google Faculty Research Award for the project "Explainable and Auditable AI for Software Quality Assurance."",
    type: "award",
  },
];
