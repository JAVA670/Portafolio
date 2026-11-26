import type { Metadata, Viewport } from "next";
import { Anton, Archivo, JetBrains_Mono, Jost } from "next/font/google";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

/** Condensed industrial display face — headlines only. */
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** Geometric sans — only for the Thrulenses Studio logo. */
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

/** Variable grotesk: expanded (wdth 115) for labels, normal for body. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/** Technical metadata, navigation and specs. */
const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description =
  "Concert and festival photography and film. Shot from the barrier, the booth and the crowd. Based in the USA — available worldwide.";

export const metadata: Metadata = {
  title: "THRULENSES670 — Concert Photography & Film",
  description,
  keywords: [
    "festival photography",
    "EDC",
    "concert photography",
    "festival photographer",
    "videography",
    "aftermovie",
    "DJ photography",
  ],
  openGraph: {
    title: "THRULENSES670",
    description,
    type: "website",
    images: [{ url: "/assets/photography/edc-109.jpg", width: 2000, height: 1333 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "THRULENSES670",
    description,
    images: ["/assets/photography/edc-109.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${jost.variable} ${archivo.variable} ${mono.variable}`}>
      <body className="grain">
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
