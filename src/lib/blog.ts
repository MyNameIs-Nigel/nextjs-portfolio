import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";
import { CATEGORIES, type Post, type PostMeta } from "./blog-types";
import { isCalendarDate } from "./dates";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const POST_FILE = /^(.+)\.mdx?$/;

function postDate(value: unknown) {
  // Unquoted YAML dates (`date: 2026-03-12`) arrive as Date objects at UTC midnight.
  const date = value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString().slice(0, 10) : value;
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && isCalendarDate(date) ? date : undefined;
}

/** Parses one post's frontmatter and body. Malformed frontmatter fails the build, naming the post. */
export function parsePost(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const invalid = (problem: string): never => {
    throw new Error(`Blog post "${slug}" ${problem}.`);
  };
  if (typeof data.title !== "string" || !data.title.trim()) invalid("needs a title");
  const date = postDate(data.date) ?? invalid("needs a date in YYYY-MM-DD format");
  const modified = data.modified == null ? undefined : postDate(data.modified) ?? invalid("has a modified date that isn't in YYYY-MM-DD format");
  if (!CATEGORIES.includes(data.category)) invalid(`needs a category: one of ${CATEGORIES.join(", ")}`);

  return {
    slug,
    title: data.title.trim(),
    date,
    ...(modified && modified !== date ? { modified } : {}),
    category: data.category,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    coverImage: typeof data.coverImage === "string" ? data.coverImage : "",
    readingTime: readingTime(content).text,
    content,
  };
}

function postFiles() {
  // No folder just means no posts yet; never write to the filesystem while rendering.
  return fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter((file) => POST_FILE.test(file)) : [];
}

function readPost(file: string) {
  return parsePost(file.replace(POST_FILE, "$1"), fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
}

/** Every post's metadata, newest first. */
export function getAllPosts(): PostMeta[] {
  return postFiles()
    .map((file) => {
      // Drop the body: the index is a client component and only needs metadata.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content, ...meta } = readPost(file);
      return meta;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/**
 * One post by slug, or null. Slugs are matched against the files that exist, so
 * a crafted slug can't reach another path. Cached so metadata and the page share one read.
 */
export const getPostBySlug = cache((slug: string): Post | null => {
  const file = postFiles().find((name) => name.replace(POST_FILE, "$1") === slug);
  return file ? readPost(file) : null;
});
