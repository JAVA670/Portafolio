import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { Services } from "@/components/home/Services";
import { Work } from "@/components/home/Work";
import { Marquee } from "@/components/home/Marquee";
import { Process } from "@/components/home/Process";
import { Contact } from "@/components/home/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Statement />
        <Services />
        <Work />
        <Marquee />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
