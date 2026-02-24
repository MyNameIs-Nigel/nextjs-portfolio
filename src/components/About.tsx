"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: "6+", label: "Years Experience" },
  { value: "25+", label: "Portrait Projects" },
  { value: "10+", label: "Happy Clients" },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 lg:py-32">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-12"
      >
        {/* Image column */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/5] overflow-hidden rounded-lg"
        >
          <Image
            src="/profile.jpg"
            alt="Nigel Smith — photographer portrait"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Accent bar */}
          <div className="absolute bottom-0 left-0 h-1.5 w-24 bg-accent" />
        </motion.div>

        {/* Text column */}
        <div className="flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm font-medium uppercase tracking-[0.2em] text-accent"
          >
            About Me
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Crafting visuals
            <br />
            that resonate.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted"
          >
            I&apos;m Nigel Smith, a photographer based in Monroe, GA. 
            For over six years, I&apos;ve practiced shooting compelling,
            bold, and creative shots as a hobby, with both digital and
            analog film mediums. My work consists mainly of still-life,
            portrait, and automotive.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 max-w-lg text-lg leading-relaxed text-muted"
          >
            Whether you&apos;re wanting some sick shots of your whip, or
            you want your next instagram post to show your glamorous face,
            I bring the same commitment to visual excellence and narrative
            clarity.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-accent">
                  {stat.value}
                </span>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
