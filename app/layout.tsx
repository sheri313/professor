import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
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
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <noscript>
          <style>
            {".reveal{opacity:1!important;transform:none!important}header.fixed{position:absolute!important}"}
          </style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
