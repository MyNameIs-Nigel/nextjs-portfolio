import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogIndex from "@/components/BlogIndex";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Nigel Smith",
  description:
    "Thoughts on photography, automotive work, coding projects, and classwork from Nigel Smith.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Page hero */}
        <div className="bg-foreground px-6 pt-32 pb-20 lg:px-12 lg:pt-40 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-white/50">
              Writing
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              Blog
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
              Notes on photography, cars, code, and the things I&apos;m learning.
            </p>
          </div>
        </div>

        <BlogIndex posts={posts} />
      </main>
      <Footer />
    </>
  );
}
