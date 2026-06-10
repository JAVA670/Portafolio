import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Gallery } from "@/components/sections/Gallery";
import { DJSets } from "@/components/sections/DJSets";
import { Aftermovies } from "@/components/sections/Aftermovies";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Gallery />
      <DJSets />
      <Aftermovies />
      <Contact />
      <Footer />
    </main>
  );
}
