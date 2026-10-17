import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/ReadingProgress";
import { mdxComponents } from "@/components/MdxComponents";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { CATEGORY_COLORS, formatPostDate } from "@/lib/blog-types";

interface Props {
  params: Promise<{ slug: string }>;
}

// Every post is generated at build time; any other slug is a static 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Nigel Smith`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: post.coverImage ? [post.coverImage] : [] },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.modified ?? post.date,
    },
  };
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M11.5 7h-9m0 0L6 3.5M2.5 7L6 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <ReadingProgress />
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background">
        {/* Post header */}
        <div className="bg-foreground px-6 pt-32 pb-12 lg:px-12 lg:pt-40 lg:pb-16">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
            >
              <BackArrow />
              All posts
            </Link>

            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category]}`}
              >
                {post.category}
              </span>
              <span className="text-sm text-white/40">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {post.readingTime}
              </span>
              {post.modified && (
                <span className="text-sm text-white/35 italic">
                  Last updated: <time dateTime={post.modified}>{formatPostDate(post.modified)}</time>
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-white/60">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative mx-auto -mt-px h-[40vh] max-w-5xl overflow-hidden sm:h-[50vh] lg:h-[60vh]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        )}

        {/* Article body */}
        <article className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-24">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>

        {/* Post footer nav */}
        <div className="border-t border-border px-6 py-10 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              <BackArrow />
              Back to all posts
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
