import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { Lineup } from "@/components/sections/Lineup";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Gallery } from "@/components/sections/Gallery";
import { Videos } from "@/components/sections/Videos";
import { Specs } from "@/components/sections/Specs";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <Header />
      <Hero />
      <Lineup />
      <SelectedWork />
      <Gallery />
      <Videos />
      <Specs />
      <Contact />
      <Footer />
    </main>
  );
}
