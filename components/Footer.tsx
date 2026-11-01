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
  const { name, labName, department, university, socials } = profile;

  return (
    <footer className="bg-navy-950 py-12 text-sm text-navy-300">
      <div className="page-container">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-white">{labName}</p>
            <p className="mt-1 max-w-sm">
              {department}, {university}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p>
            © <CopyrightYear /> {name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-1">
            {socials.map(({ platform, url, icon: Icon }) => (
              <li key={platform}>
                <a
                  href={url}
                  aria-label={platform}
                  title={platform}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon aria-hidden="true" className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
