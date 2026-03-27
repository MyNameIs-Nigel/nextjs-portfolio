# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server at localhost:3000
- `npm run build` — production build (Next.js standalone output)
- `npm run lint` — run ESLint
- `npm start` — serve production build
- `docker build -t portfolio . && docker run -p 3000:3000 portfolio` — Docker build/run

## Architecture

Photography portfolio site for Nigel Smith, deployed on Vercel at ndsironwood.com.

**Framework:** Next.js 16 App Router with TypeScript, Tailwind CSS 4, Framer Motion.

**Source layout (`src/`):**
- `app/page.tsx` — single-page home composing section components (Navbar, Hero, Portfolio, About, Contact, Footer)
- `app/blog/page.tsx` — blog index page
- `app/blog/[slug]/page.tsx` — dynamic blog post page using MDX (next-mdx-remote/rsc)
- `app/layout.tsx` — root layout with Inter + Playfair Display fonts, Vercel Analytics
- `components/` — section components for the home page + blog UI (BlogIndex, MdxComponents, ReadingProgress)
- `lib/blog.ts` + `lib/blog-types.ts` — file-system blog engine reading MDX from `content/blog/`

**Blog system:** Posts are `.mdx` files in `content/blog/` with gray-matter frontmatter (title, date, modified, category, excerpt, coverImage). Categories are a fixed union type: Automotive, Classwork, Coding Projects, Photography. Posts are statically generated via `generateStaticParams`.

**Path alias:** `@/*` maps to `./src/*`.

**Images:** Remote images allowed from `images.unsplash.com` (configured in `next.config.ts`). Build output is `standalone` mode for Docker compatibility.
