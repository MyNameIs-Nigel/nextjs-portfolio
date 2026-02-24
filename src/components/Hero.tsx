"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex h-screen w-full items-end overflow-hidden">
      {/* Background video / image fallback */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source
          src="https://cdn.coverr.co/videos/coverr-a-photographer-taking-photos-in-a-studio-1584/1080p.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-12 lg:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-white/70"
        >
          Photographer &amp; Life-Long Nerd
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-[family-name:var(--font-playfair)] text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-8xl"
        >
          Visual
          <br />
          Storyteller
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 flex items-center gap-6"
        >
          <a
            href="#work"
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:text-white"
          >
            View Work
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-white/80 underline underline-offset-4 transition-colors hover:text-white"
          >
            Get in Touch
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:bottom-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs tracking-widest text-white/50 uppercase">
              Scroll
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-white/50"
            >
              <path
                d="M10 4v12m0 0l-4-4m4 4l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
