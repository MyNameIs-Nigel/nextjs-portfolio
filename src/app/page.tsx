import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getDailyHeroImage } from "@/lib/hero-images";
import type { Metadata } from "next";
import { siteDescription } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { title: "Nigel Smith — Photographer", description: siteDescription, url: "/", type: "website", siteName: "Nigel Smith Photography", locale: "en_US" },
};

// Re-evaluate at least hourly so the daily rotation advances on the
// statically-cached page (otherwise the build-time date would freeze).
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero src={getDailyHeroImage()} />
        <Portfolio />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
