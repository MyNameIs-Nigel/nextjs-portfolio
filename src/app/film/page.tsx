import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilmJournal from "@/components/FilmJournal";
import { filmFrames } from "@/lib/film";
import "./film.css";

export const metadata: Metadata = {
  title: "Film — Nigel Smith, in 35mm",
  description: "A selection of Nigel Smith’s favorite photographs on 35mm film. A few frames, and the stories behind them.",
  alternates: { canonical: "/film" },
  openGraph: { title: "Nigel Smith, in 35mm", description: "A few frames. A closer look.", url: "/film", images: ["/images/film/fuji400-2.webp"] },
};

export default function FilmPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="about-film">
        <div className="film-layout">
          <header className="film-intro">
            <div className="film-leader" aria-hidden="true"><span>NS — PERSONAL ARCHIVE</span><b>135</b><span>35mm Film ↓</span></div>
            <div className="film-intro-copy">
              <p className="film-eyebrow">Film / Highlighted Shots</p>
              <h1>My favorites,<br />in <em>35mm.</em></h1>
              <div className="film-intro-bottom">
                <p>I&apos;m Nigel Smith, a photographer based in Monroe, Georgia. I work with both digital and analog film, shooting still life, portraits, and cars. Here&apos;s a closer look through a few of my favorite shots on film.</p>
                <a href={`#${filmFrames[0].id}`} className="film-scroll">Scroll to explore <span aria-hidden="true">↓</span></a>
              </div>
              <div className="film-index"><span>Selected frames / 01—{String(filmFrames.length).padStart(2, "0")}</span><span>Film photographs, personal stories</span></div>
            </div>
          </header>
          <FilmJournal frames={filmFrames} />
          <section className="film-outro">
            <div className="film-tail" aria-hidden="true">END <span>○</span></div>
            <div><p className="film-eyebrow">Beyond the roll</p><h2>There&apos;s more<br />to the story.</h2><p>Explore the rest of my photographs, or get in touch to make something together.</p><div className="film-outro-links"><Link href="/photos">Explore the digital journal <span aria-hidden="true">↗</span></Link><Link href="/#contact">Let&apos;s talk <span aria-hidden="true">↗</span></Link></div></div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
