import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { PostMeta, Post, Category } from "./blog-types";

export type { PostMeta, Post, Category };
export { CATEGORIES } from "./blog-types";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function ensureContentDir() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

export function getAllPosts(): PostMeta[] {
  ensureContentDir();

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.(mdx|md)$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const stats = readingTime(content);

    const modified = data.modified as string | undefined;

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      ...(modified && modified !== data.date ? { modified } : {}),
      category: data.category as Category,
      excerpt: data.excerpt as string,
      coverImage: data.coverImage as string,
      readingTime: stats.text,
    } satisfies PostMeta;
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): Post | null {
  ensureContentDir();

  const extensions = ["mdx", "md"];
  for (const ext of extensions) {
    const filepath = path.join(CONTENT_DIR, `${slug}.${ext}`);
    if (fs.existsSync(filepath)) {
      const raw = fs.readFileSync(filepath, "utf8");
      const { data, content } = matter(raw);
      const stats = readingTime(content);

      const modified = data.modified as string | undefined;

      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        ...(modified && modified !== data.date ? { modified } : {}),
        category: data.category as Category,
        excerpt: data.excerpt as string,
        coverImage: data.coverImage as string,
        readingTime: stats.text,
        content,
      };
    }
  }

  return null;
}
