"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="bg-foreground py-24 lg:py-32">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-12"
      >
        {/* Left column - CTA text */}
        <div className="flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium uppercase tracking-[0.2em] text-accent"
          >
            Get in Touch
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Let&apos;s capture
            <br />
            together.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-stone-400"
          >
            Have a project in mind? I&apos;d love to hear about it. Drop me a
            message and I&apos;ll get back to you within 24-48 hours.
          </motion.p>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-accent"
                >
                  <path
                    d="M3 3h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0115 15H3a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 013 3z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16.5 4.5L9 10.5 1.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-stone-300">nigel.nds.smith@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-accent"
                >
                  <path
                    d="M9 1.5a6 6 0 016 6c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 016-6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="9"
                    cy="7.5"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="text-stone-300">Rexburg, ID</span>
            </div>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex gap-4"
          >
              <a
                target="_blank"
                key="Instagram"
                href="https://instagram.com/nigel.s617"
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/70 transition-all hover:border-accent hover:text-accent"
              >
                Instagram
              </a>
              <a
                target="_blank"
                key="Flickr"
                href="https://www.flickr.com/photos/snoigel/"
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/70 transition-all hover:border-accent hover:text-accent"
              >
                Flickr
              </a>
          </motion.div>
        </div>

        {/* Right column - Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center"
        >
          {submitted ? (
            <div className="w-full rounded-2xl bg-white/5 p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  className="text-accent"
                >
                  <path
                    d="M7 14l5 5 9-9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
                Message Sent!
              </h3>
              <p className="mt-2 text-stone-400">
                Thanks for reaching out. I&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full space-y-6 rounded-2xl bg-white/5 p-8 lg:p-10"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-stone-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-500 outline-none transition-colors focus:border-accent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-stone-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-500 outline-none transition-colors focus:border-accent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label
                  htmlFor="project"
                  className="mb-2 block text-sm font-medium text-stone-300"
                >
                  Project Type
                </label>
                <select
                  id="project"
                  name="project"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-accent"
                >
                  <option value="" className="bg-stone-900">
                    Select a project type
                  </option>
                  <option value="portrait" className="bg-stone-900">
                    Portrait Session
                  </option>
                  <option value="automotive" className="bg-stone-900">
                    Automotive
                  </option>
                  <option value="other" className="bg-stone-900">
                    Special Requests
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-stone-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-stone-500 outline-none transition-colors focus:border-accent"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-accent py-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Send Message
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
