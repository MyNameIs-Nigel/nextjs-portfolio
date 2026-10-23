"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { FilmFrame } from "@/lib/about-film";

export default function FilmJournal({ frames }: { frames: FilmFrame[] }) {
  const journal = useRef<HTMLDivElement>(null);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    const rows = Array.from(journal.current?.querySelectorAll<HTMLElement>(".film-scene") || []);
    let pending = 0;
    const update = () => {
      pending = 0;
      // Use a reading line below the navigation. Only section changes move the roll.
      const readingLine = window.innerHeight * 0.4;
      let active = 0;
      rows.forEach((row, index) => {
        if (row.getBoundingClientRect().top <= readingLine) active = index;
      });
      setActiveFrame(active);
    };
    const schedule = () => { if (!pending) pending = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [frames]);

  return (
    <div className="film-journal" ref={journal}>
      <nav className="film-navigator" aria-label="Film frames">
        <div className="film-track" style={{ "--active-frame": activeFrame } as CSSProperties}>
          {frames.map((frame, index) => {
            const number = String(index + 1).padStart(2, "0");
            const landscape = frame.orientation === "landscape";
            return (
              <div className={`film-exposure ${activeFrame === index ? "is-active" : ""}`} key={frame.id}>
                <span className={`film-edge film-edge--stock ${!frame.filmStock ? "film-edge--unknown" : ""}`}>{frame.filmStock || "Stock unknown"} · 135</span>
                <a className="film-window" href={`#${frame.id}`} aria-label={`View frame ${number}: ${frame.title}`} aria-current={activeFrame === index ? "location" : undefined}
                  onFocus={(event) => {
                    // Keep keyboard-focused frames visible even when outside the clipped roll.
                    if (event.currentTarget.matches(":focus-visible")) {
                      document.getElementById(frame.id)?.scrollIntoView({ block: "start", behavior: "instant" });
                      const navigator = event.currentTarget.closest("nav");
                      if (navigator) navigator.scrollTop = 0;
                    }
                  }}>

                  <Image src={`/images/about-film/${frame.id}.webp`} alt="" width={landscape ? 2100 : 1400} height={landscape ? 1400 : 2100} sizes="260px" className={landscape ? "film-scan film-scan--rotated" : "film-scan"} />
                </a>
                <span className="film-edge film-edge--number">{number} <span>▸</span> {number}A</span>
              </div>
            );
          })}
        </div>
      </nav>
      <div className="film-scenes">
      {frames.map((frame, index) => {
        const number = String(index + 1).padStart(2, "0");
        const landscape = frame.orientation === "landscape";
        const src = `/images/about-film/${frame.id}.webp`;
        return (
          <section className={`film-scene film-scene--${frame.orientation}`} id={frame.id} key={frame.id} aria-labelledby={`${frame.id}-title`}>
            <div className="film-projection" id={`projection-${frame.id}`}>
              <div className="film-projection-photo">
                <Image src={src} alt={frame.alt} width={landscape ? 2100 : 1400} height={landscape ? 1400 : 2100} sizes={landscape ? "(max-width: 900px) 90vw, 65vw" : "(max-width: 900px) 85vw, 36vw"} />
                <span className="projection-caption">35mm study <span>{number} / {String(frames.length).padStart(2, "0")}</span></span>
              </div>
              <div className="film-story">
                <span className="film-eyebrow">Frame {number} <span className="film-rule" /></span>
                <h2 id={`${frame.id}-title`}>{frame.title}</h2>
                <p className={!frame.story ? "film-story-pending" : undefined}>{frame.story || "The photograph is here. The story is still to come."}</p>
                <dl className="film-metadata">
                  {[["Camera + lens", frame.cameraLens], ["Film stock", frame.filmStock], ["Est. date", frame.estimatedDate]].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd className={value ? "" : "is-unknown"}>{value || "Unknown"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        );
      })}
      </div>
    </div>
  );
}
