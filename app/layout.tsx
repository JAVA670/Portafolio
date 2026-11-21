import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk, Syne } from "next/font/google";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "THRULENSES670 — Hard Techno Concert Photography & Videography",
  description:
    "Concert photography and videography for hard techno events. DJ sets, aftermovies, and raw warehouse coverage. Based in USA — available worldwide.",
  keywords: [
    "hard techno",
    "concert photography",
    "videography",
    "aftermovie",
    "DJ set",
    "rave",
  ],
  openGraph: {
    title: "THRULENSES670",
    description:
      "Hard techno concert photography & videography. Shot from inside the crowd.",
    type: "website",
    images: [{ url: "/assets/photography/diablo-03.jpg", width: 2000, height: 1333 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "THRULENSES670",
    description:
      "Hard techno concert photography & videography. Shot from inside the crowd.",
    images: ["/assets/photography/diablo-03.jpg"],
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
    <html lang="en" className={`${syne.variable} ${grotesk.variable} ${mono.variable} antialiased`}>
      <body className="grain">
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
