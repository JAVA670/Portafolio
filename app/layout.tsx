import type { Metadata, Viewport } from "next";
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";
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
  "Hard techno concert photography and film. Shot from the barrier, the booth and the smoke. Based in the USA — available worldwide.";

export const metadata: Metadata = {
  title: "THRULENSES670 — Hard Techno Photography & Film",
  description,
  keywords: [
    "hard techno",
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
    images: [{ url: "/assets/photography/diablo-06.jpg", width: 2000, height: 1373 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "THRULENSES670",
    description,
    images: ["/assets/photography/diablo-06.jpg"],
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
    <html lang="en" className={`${anton.variable} ${archivo.variable} ${mono.variable}`}>
      <body className="grain">
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
