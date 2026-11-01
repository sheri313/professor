import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ui/ContactForm";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { ProfessorProfile } from "@/data/professorData";

interface ContactProps {
  profile: ProfessorProfile;
}

const cardClassName = "rounded-2xl border border-white/10 bg-white/5 p-6";
const cardTitleClassName = "flex items-center gap-2 font-display font-bold text-white";
const linkClassName =
  "inline-flex items-center gap-2 wrap-anywhere font-medium text-white transition-colors hover:text-accent-300";

export default function Contact({ profile }: ContactProps) {
  const { email, phone, department, university, contactNote } = profile;
  const { officeLocation, officeAddress, officeHours } = profile;

  return (
    <section id="contact" className="bg-navy-900 py-20 lg:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading eyebrow="Contact" title="Get in touch" description={contactNote} tone="dark" />
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8">
          <Reveal className="space-y-6">
            <div className={cardClassName}>
              <h3 className={cardTitleClassName}>
                <MapPin aria-hidden="true" className="size-5 text-accent-400" />
                Office location
              </h3>
              <address className="mt-3 text-sm not-italic leading-6 text-navy-200">
                <span className="block font-semibold text-white">{officeLocation}</span>
                <span className="block">{department}</span>
                <span className="block">{university}</span>
                {officeAddress.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                <li>
                  <a href={`mailto:${email}`} className={linkClassName}>
                    <Mail aria-hidden="true" className="size-4 shrink-0 text-accent-400" />
                    {email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className={linkClassName}>
                    <Phone aria-hidden="true" className="size-4 shrink-0 text-accent-400" />
                    {phone}
                  </a>
                </li>
              </ul>
            </div>

            <div className={cardClassName}>
              <h3 className={cardTitleClassName}>
                <Clock aria-hidden="true" className="size-5 text-accent-400" />
                Office hours
              </h3>
              <dl className="mt-3 divide-y divide-white/10 text-sm">
                {officeHours.map(({ day, time, format }) => (
                  <div key={day} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-3">
                    <dt className="font-semibold text-white">{day}</dt>
                    <dd className="text-navy-200 sm:text-right">
                      {time}
                      <span className="block text-xs text-navy-300">{format}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm recipient={email} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
