import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getDailyHeroImage } from "@/lib/hero-images";

// Re-evaluate at least hourly so the daily rotation advances on the
// statically-cached page (otherwise the build-time date would freeze).
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero src={getDailyHeroImage()} />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
