import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { ChapterRail } from "@/components/fx/ChapterRail";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { MarqueeDivider } from "@/components/fx/MarqueeDivider";
import { Hero } from "@/components/sections/Hero";
import { LensPortal } from "@/components/sections/LensPortal";
import { Gallery } from "@/components/sections/Gallery";
import { Videos } from "@/components/sections/Videos";
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
      <LensPortal />
      <Gallery />
      <MarqueeDivider hot text="999999999 / / AND / / HENRIQUE CAMACHO / / MIJA / / SHIMZA / / + LOCAL HEROES / /" />
      <Videos />
      <MarqueeDivider reverse text="HOCUS POCUS MIAMI / / AEROTECHNO FESTIVAL MEDELLÍN / / LA SOLAR MEDELLÍN / /" />
      <Contact />
      <Footer />
    </main>
  );
}
