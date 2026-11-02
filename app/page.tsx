import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Publications from "@/components/Publications";
import ResearchInterests from "@/components/ResearchInterests";
import Supervision from "@/components/Supervision";
import WebGLBackground from "@/components/WebGLBackground";
import {
  navLinks,
  profile,
  projects,
  publications,
  researchInterests,
  researchKeywords,
  researchOutputSummary,
  supervision,
} from "@/data/profile";

export default function Home() {
  const { name, university, headlineLead, headlineHighlight, tagline } = profile;
  const { profileImage, stats } = profile;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-900"
      >
        Skip to content
      </a>
      <WebGLBackground />
      <Navbar name={name} subtitle={profile.department} links={navLinks} />
      <main id="main" className="flex-1">
        <Hero
          profile={{
            name,
            university,
            badge: supervision.status,
            headlineLead,
            headlineHighlight,
            tagline,
            profileImage,
            stats,
          }}
        />
        <About profile={profile} projects={projects} />
        <ResearchInterests interests={researchInterests} keywords={researchKeywords} />
        <Supervision supervision={supervision} />
        <Publications
          publications={publications}
          highlightAuthors={profile.citationNames}
          outputs={researchOutputSummary}
        />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} links={navLinks} />
    </>
  );
}
