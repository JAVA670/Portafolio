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

export default function Home() {
  return (
    <>
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Work />
        <Intro />
        <Index />
        <Films />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
