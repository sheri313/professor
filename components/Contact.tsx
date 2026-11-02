import { Mail } from "lucide-react";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import ContactForm from "@/components/ui/ContactForm";
import PostcardFlip from "@/components/ui/PostcardFlip";
import Reveal from "@/components/ui/Reveal";
import type { Profile } from "@/data/profile";

interface ContactProps {
  profile: Profile;
}

interface PostcardFrontProps {
  name: string;
  university: string;
}

const addressLineClassName = "border-b border-navy-200 py-1.5";

function PostcardFront({ name, university }: PostcardFrontProps) {
  return (
    // Top-aligned below lg, where the card is taller than the screen.
    <div className="relative flex size-full flex-col items-center overflow-hidden rounded-2xl bg-accent-900 px-6 pb-8 pt-20 text-center text-white shadow-[0_48px_90px_-40px_rgb(12_20_35/0.55)] lg:justify-center lg:pt-8">
      <div className="postcard-rays absolute inset-0" />

      <p className="relative font-serif text-4xl italic text-accent-100 sm:text-6xl">
        Greetings from
      </p>
      <p className="relative mt-3 max-w-5xl font-display text-[clamp(2.75rem,7.5vw,6.25rem)] font-extrabold uppercase leading-[0.98] tracking-tight [text-shadow:0.05em_0.05em_0_var(--color-accent-600)]">
        {name}
      </p>
      <p className="relative mt-6 font-mono text-xs uppercase tracking-[0.3em] text-accent-200">
        {university}
      </p>
      <p className="absolute bottom-6 font-serif text-xl italic text-accent-200">
        Wish you were here
      </p>
    </div>
  );
}

export default function Contact({ profile }: ContactProps) {
  const { name, email, department, university, contactNote, profileImage } = profile;

  return (
    <section id="contact" className="relative overflow-x-clip bg-paper-100 py-20 lg:py-24">
      <div className="page-container-wide">
        <Reveal className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end">
          <div>
            <p className="font-mono text-sm font-medium uppercase tracking-widest text-accent-800">
              Contact
            </p>
            <h2 className="mt-1 font-serif text-[clamp(3.75rem,9vw,7.5rem)] italic leading-none tracking-tight text-navy-900">
              Get in touch
            </h2>
          </div>
          <p className="text-lg leading-8 text-navy-600 lg:pb-2">{contactNote}</p>
        </Reveal>

        <div className="mt-10 lg:mt-12">
          <PostcardFlip front={<PostcardFront name={name} university={university} />}>
            <ContactForm
              recipient={email}
              recipientName={name}
              postmarkTop={university}
              postmarkBottom={department}
            >
              <div className="flex justify-end">
                <div className="drop-shadow-md">
                  <div className="postage-stamp w-28 bg-white p-3 sm:w-32">
                    <div className="relative flex aspect-4/5 items-center justify-center overflow-hidden bg-accent-100">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt=""
                          fill
                          sizes="8rem"
                          className="object-cover object-top"
                        />
                      ) : (
                        <Avatar name={name} size={64} className="bg-accent-800 text-white" />
                      )}
                    </div>
                    <p className="mt-1.5 text-center font-mono text-[0.625rem] uppercase tracking-widest text-navy-700">
                      Air mail
                    </p>
                  </div>
                </div>
              </div>

              <address className="mt-8 not-italic">
                <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-navy-500">
                  To
                </p>
                <ul className="mt-1 text-navy-800">
                  <li className={`${addressLineClassName} font-serif text-2xl text-navy-900`}>
                    {name}
                  </li>
                  <li className={`${addressLineClassName} text-sm leading-6`}>{department}</li>
                  <li className={`${addressLineClassName} text-sm`}>{university}</li>
                </ul>

                <p className="mt-5 text-sm font-medium text-navy-900">
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 wrap-anywhere transition-colors hover:text-accent-700"
                  >
                    <Mail aria-hidden="true" className="size-4 shrink-0 text-accent-700" />
                    {email}
                  </a>
                </p>
              </address>
            </ContactForm>
          </PostcardFlip>
        </div>
      </div>
    </section>
  );
}
