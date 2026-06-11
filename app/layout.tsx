import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "THRULENSES670 — Hard Techno Concert Photography & Videography",
  description:
    "Concert photography and videography for hard techno events. DJ sets, aftermovies, and raw warehouse coverage. Available worldwide.",
  keywords: [
    "hard techno",
    "concert photography",
    "videography",
    "aftermovie",
    "DJ set",
    "rave",
  ],
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} antialiased`}>
      <body className="grain">
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
