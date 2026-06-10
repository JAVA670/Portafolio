import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { ChapterRail } from "@/components/fx/ChapterRail";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { MarqueeDivider } from "@/components/fx/MarqueeDivider";
import { Hero } from "@/components/sections/Hero";
import { Gallery } from "@/components/sections/Gallery";
import { DJSets } from "@/components/sections/DJSets";
import { Aftermovies } from "@/components/sections/Aftermovies";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Preloader />
      <Cursor />
      <ChapterRail />
      <ScrollProgress />
      <Header />
      <Hero />
      <Gallery />
      <MarqueeDivider hot text="PRESS PLAY / / FEEL THE HEAT / / 140+ BPM / / NO MERCY / /" />
      <DJSets />
      <MarqueeDivider reverse text="VERTICAL CUTS / / 9:16 / / BUILT FOR THE FEED / / RAW ENERGY / /" />
      <Aftermovies />
      <MarqueeDivider hot reverse text="BOOK THE LENS / / WORLDWIDE / / PHOTO + VIDEO + DRONE / /" />
      <Contact />
      <Footer />
    </main>
  );
}
