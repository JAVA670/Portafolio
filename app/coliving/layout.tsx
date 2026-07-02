import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { HouseProvider } from "@/components/coliving/HouseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoHouse — Coliving House Manager",
  description:
    "Rooms, residents, chores and supplies for your coliving house — who did what, and when.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f4",
};

/**
 * The coliving app lives inside the portfolio site but ships its own light
 * theme. The data-coliving attribute scopes the CSS overrides in globals.css
 * (grain overlay off, light color-scheme, focus/selection colors).
 */
export default function ColivingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-coliving className={`${inter.className} min-h-dvh bg-stone-100 text-stone-900`}>
      <HouseProvider>{children}</HouseProvider>
    </div>
  );
}
