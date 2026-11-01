"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, Moon, X } from "lucide-react";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import type { NavLink } from "@/data/professorData";

interface NavbarProps {
  name: string;
  lab: string;
  links: NavLink[];
}

export default function Navbar({ name, lab, links }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));

  useEffect(() => {
    const sections = links.flatMap(({ href }) => document.querySelector(href) ?? []);

    // A thin band across the middle of the viewport marks the current section.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          const href = `#${target.id}`;
          setActiveHref((current) => {
            if (isIntersecting) return href;
            return current === href ? null : current;
          });
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  const solid = scrolled || menuOpen;
  const iconButtonTone = solid ? "text-navy-800" : "text-white";

  return (
    <header
      className={`nav-drop fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        solid ? "border-navy-200/70 bg-white/95 shadow-sm" : "border-white/10 bg-navy-950/40"
      }`}
    >
      <nav aria-label="Primary" className="page-container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <Avatar name={name} size={36} className="bg-accent-500 text-navy-950" />
          <span className="leading-tight">
            <span
              className={`block font-display text-sm font-bold tracking-tight ${
                solid ? "text-navy-900" : "text-white"
              }`}
            >
              {name}
            </span>
            <span className={`block text-xs ${solid ? "text-navy-600" : "text-navy-300"}`}>
              {lab}
            </span>
          </span>
        </a>

        <div className="flex items-center gap-1">
          <ul className="mr-1 hidden items-center gap-1 md:flex">
            {links.map(({ label, href }) => {
              const active = activeHref === href;
              return (
                <li key={href} className="relative">
                  <a
                    href={href}
                    aria-current={active ? "true" : undefined}
                    className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? solid
                          ? "text-navy-900"
                          : "text-white"
                        : solid
                          ? "text-navy-700 hover:text-navy-900"
                          : "text-navy-200 hover:text-white"
                    }`}
                  >
                    {label}
                  </a>
                  {active && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent-500"
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Placeholder until the site has a dark theme. */}
          <button
            type="button"
            disabled
            aria-label="Dark mode (coming soon)"
            title="Dark mode coming soon"
            className={`cursor-not-allowed rounded-md p-2 opacity-60 ${iconButtonTone}`}
          >
            <Moon aria-hidden="true" className="size-5" />
          </button>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className={`rounded-md p-2 md:hidden ${iconButtonTone}`}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {menuOpen && (
          // Avoid animating height here: measuring it makes framer-motion call
          // window.scrollTo, which cancels the smooth scroll from the tapped link.
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden"
          >
            <ul className="page-container space-y-1 pb-4">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-navy-800 hover:bg-navy-100"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
