import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import MotionProvider from "@/components/ui/MotionProvider";
import { professorProfile } from "@/data/professorData";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

// Only used below the fold, so it shouldn't compete with the hero's fonts for the first paint.
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  preload: false,
});

export const metadata: Metadata = {
  title: `${professorProfile.name} | ${professorProfile.labName}`,
  description: professorProfile.shortBio,
  openGraph: {
    title: `${professorProfile.name} | ${professorProfile.labName}`,
    description: professorProfile.shortBio,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <noscript>
          <style>
            {".gsap-reveal{opacity:1!important;transform:none!important}header.fixed{position:absolute!important}.track-stage{height:auto!important}.publication-carousel{display:none!important}.member-panel{visibility:visible!important;opacity:1!important;translate:none!important;grid-row:auto!important;margin-bottom:2rem}"}
          </style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
