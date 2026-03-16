import type { MDXComponents } from "mdx/types";
import Image from "next/image";

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="font-[family-name:var(--font-playfair)] mt-12 mb-4 text-4xl font-bold leading-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-[family-name:var(--font-playfair)] mt-10 mb-4 text-3xl font-bold leading-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold text-foreground">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-6 leading-[1.85] text-stone-700">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-4 border-accent pl-6 italic text-stone-600">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mb-6 space-y-2 pl-6 [&>li]:relative [&>li]:before:absolute [&>li]:before:-left-4 [&>li]:before:top-[0.6em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-accent">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 list-decimal space-y-2 pl-6 marker:text-accent">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-stone-700">{children}</li>
  ),
  code: ({ children }) => (
    <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-foreground p-6 text-sm text-stone-200">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-border" />,
  img: ({ src, alt }) => (
    <span className="my-8 block overflow-hidden rounded-xl">
      <Image
        src={src ?? ""}
        alt={alt ?? ""}
        width={1200}
        height={675}
        className="h-auto w-full object-cover"
      />
    </span>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-stone-600">{children}</em>,
};
