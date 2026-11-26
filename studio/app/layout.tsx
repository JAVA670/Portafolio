import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

/** Editorial display serif — headlines only. */
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

/** Grotesk for body and UI (shared with the concert gallery). */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/** Small technical labels (shared with the concert gallery). */
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description =
  "Thrulenses Studio — event, portrait and celebration photography. Based in the USA, available worldwide.";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Thrulenses Studio — Events, Portraits & Celebrations",
    template: "%s — Thrulenses Studio",
  },
  description,
  keywords: [
    "event photography",
    "portrait photography",
    "birthday photographer",
    "celebration photography",
    "photo studio",
  ],
  openGraph: { title: "Thrulenses Studio", description, type: "website" },
  twitter: { card: "summary_large_image", title: "Thrulenses Studio", description },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${archivo.variable} ${mono.variable}`}>
      <body>
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
