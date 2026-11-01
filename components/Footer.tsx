import { Sparkles } from "lucide-react";
import { cacheLife } from "next/cache";
import type { NavLink, ProfessorProfile } from "@/data/professorData";

interface FooterProps {
  profile: ProfessorProfile;
  links: NavLink[];
}

// A bare new Date() fails the prerender under cacheComponents, so cache the value.
async function CopyrightYear() {
  "use cache";
  cacheLife("days");

  return new Date().getFullYear();
}

export default function Footer({ profile, links }: FooterProps) {
  const { labName, department, university, socials } = profile;

  return (
    <footer className="bg-navy-950 py-12 text-sm text-navy-300">
      <div className="page-container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.5fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg font-bold text-white">{labName}</p>
            <p className="mt-1 max-w-sm leading-6">
              {department}, {university}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="font-semibold text-white">Explore</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-semibold text-white">Academic profiles</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {socials.map(({ platform, url, icon: Icon }) => (
                <li key={platform}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © <CopyrightYear /> {university}. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/10 px-3 py-1 text-xs text-navy-300 lg:self-auto">
            <Sparkles aria-hidden="true" className="size-3.5 shrink-0 text-accent-400" />
            Designed &amp; Optimized for Academic Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
