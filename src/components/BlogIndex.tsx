"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { PostMeta, Category } from "@/lib/blog-types";
import { CATEGORIES } from "@/lib/blog-types";

const CATEGORY_COLORS: Record<Category, string> = {
  Automotive: "bg-amber-100 text-amber-800",
  Classwork: "bg-blue-100 text-blue-800",
  "Coding Projects": "bg-emerald-100 text-emerald-800",
  Photography: "bg-rose-100 text-rose-800",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  posts: PostMeta[];
}

export default function BlogIndex({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const filtered =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
      {/* Category filter chips */}
      <div className="mb-12 flex flex-wrap items-center gap-3">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative rounded-full px-5 py-2 text-sm font-medium tracking-wide uppercase transition-colors ${
              activeCategory === cat
                ? "text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {activeCategory === cat && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      {/* Post grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted">
              No posts in this category yet.
            </p>
          )}
          {filtered.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function PostCard({ post, index }: { post: PostMeta; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        {/* Cover image */}
        <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl bg-stone-100">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-stone-200" />
          )}
          {/* Category badge */}
          <span
            className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category]}`}
          >
            {post.category}
          </span>
        </div>

        {/* Meta */}
        <div className="mb-2 flex items-center gap-3 text-xs text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        {/* Title */}
        <h2 className="font-[family-name:var(--font-playfair)] mb-2 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="line-clamp-3 text-sm leading-relaxed text-stone-500">
          {post.excerpt}
        </p>

        {/* Read more */}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover">
          Read post
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 7h9m0 0L8 3.5M11.5 7L8 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </motion.article>
  );
}
