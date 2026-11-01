import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { ProfessorProfile } from "@/data/professorData";

interface ContactProps {
  profile: ProfessorProfile;
}

interface ContactDetail {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

export default function Contact({ profile }: ContactProps) {
  const { email, phone, officeLocation, officeHours, university } = profile;

  const details: ContactDetail[] = [
    { label: "Email", value: email, icon: Mail, href: `mailto:${email}` },
    { label: "Phone", value: phone, icon: Phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` },
    { label: "Office", value: `${officeLocation}, ${university}`, icon: MapPin },
    { label: "Office hours", value: officeHours, icon: Clock },
  ];

  return (
    <section id="contact" className="bg-navy-900 py-20 lg:py-24">
      <div className="page-container grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            description={profile.contactNote}
            tone="dark"
          />
          <a
            href={`mailto:${email}`}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-accent-400"
          >
            <Mail aria-hidden="true" className="size-4" />
            Send an email
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon, href }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:first:col-span-2 sm:last:col-span-2"
              >
                <dt className="flex items-center gap-2 text-sm font-medium text-navy-300">
                  <Icon aria-hidden="true" className="size-4 text-accent-400" />
                  {label}
                </dt>
                <dd className="mt-2 wrap-break-word font-semibold text-white">
                  {href ? (
                    <a href={href} className="hover:text-accent-300">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
