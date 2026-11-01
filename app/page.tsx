import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Publications from "@/components/Publications";
import RecruitmentBanner from "@/components/RecruitmentBanner";
import ResearchInterests from "@/components/ResearchInterests";
import Teaching from "@/components/Teaching";
import Team from "@/components/Team";
import {
  courses,
  footerLinks,
  navLinks,
  professorProfile,
  publications,
  recruitment,
  researchInterests,
  teamMembers,
} from "@/data/professorData";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-900"
      >
        Skip to content
      </a>
      <Navbar name={professorProfile.name} lab={professorProfile.labName} links={navLinks} />
      <main id="main" className="flex-1">
        <Hero profile={professorProfile} />
        <About profile={professorProfile} />
        <ResearchInterests interests={researchInterests} />
        <Publications
          publications={publications}
          highlightAuthor={professorProfile.citationName}
        />
        <Team members={teamMembers} />
        <Teaching courses={courses} />
        <RecruitmentBanner recruitment={recruitment} email={professorProfile.email} />
        <Contact profile={professorProfile} />
      </main>
      <Footer profile={professorProfile} links={footerLinks} />
    </>
  );
}
