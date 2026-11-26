import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Work } from "@/components/sections/Work";
import { Index } from "@/components/sections/Index";
import { Films } from "@/components/sections/Films";
import { Booking } from "@/components/sections/Booking";
import { Ticker } from "@/components/sections/Ticker";
import { LensDive } from "@/components/sections/LensDive";
import { StudioBand } from "@/components/sections/StudioBand";
import { artists, stages } from "@/lib/mockData";

export default function Home() {
  return (
    <>
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <LensDive />
        <Work />
        <Ticker items={artists} />
        <Intro />
        <Index />
        <Films />
        <StudioBand />
        <Ticker items={stages.map((stage) => stage.name)} reverse duration={80} />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
