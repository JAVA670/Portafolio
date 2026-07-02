import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { HouseProvider } from "@/components/coliving/HouseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoHouse — Coliving House Manager",
  description:
    "Rooms, residents, chores and supplies for your coliving house — synced live with your roommates.",
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

/**
 * The coliving app lives inside the portfolio site but ships its own dark
 * theme. The data-coliving attribute scopes the CSS overrides in globals.css
 * (grain overlay off, focus/selection colors).
 */
export default function ColivingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-coliving className={`${inter.className} min-h-dvh bg-slate-950 text-slate-100`}>
      <HouseProvider>{children}</HouseProvider>
    </div>
  );
}
