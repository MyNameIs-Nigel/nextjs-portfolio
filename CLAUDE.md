# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server at localhost:3000
- `npm run build` — production build (Next.js standalone output)
- `npm run lint` — run ESLint
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)
- `npm test` — unit tests (Node's built-in `node:test`, Node 22.15+; no extra test framework)
- `npm run test:coverage` — unit tests with a coverage report and minimum thresholds (run in CI)
- `npm run test:integration` — boots `next dev` against in-memory R2 and webhook fixtures and checks the real pages and APIs
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
- `app/photos/` + `app/admin/photos/` — public photo journal and owner-only uploader backed by Cloudflare R2 (see `docs/PHOTO-JOURNAL.md`)
- `app/api/` — contact form (Discord webhook) and photo upload/session routes
- `app/%5Fselfcheck/route.ts` — health check served at `/_selfcheck` (`_folders` are private in the App Router, so the folder name is URL-encoded)
- `components/` — section components for the home page, photo journal, and blog UI
- `lib/blog.ts` + `lib/blog-types.ts` — file-system blog engine reading MDX from `content/blog/`
- `lib/photo-schema.ts` — photo validation, image keys, journal pagination; `lib/r2.ts` — R2 storage
- `lib/http.ts` — shared API helpers (`privateJson`, `readJson`, `sameOrigin`); `lib/dates.ts` — timezone-safe calendar dates

**Blog system:** Posts are `.mdx` files in `content/blog/` with gray-matter frontmatter (title, date, modified, category, excerpt, coverImage). Dates are `YYYY-MM-DD`; a missing title, invalid date, or unknown category fails the build. Categories are a fixed union type: Automotive, Classwork, Coding Projects, Photography. Posts are statically generated via `generateStaticParams` (`dynamicParams = false`).

**Dates:** Format calendar dates with `formatPostDate`/`formatPhotoDate` (UTC-pinned), never `toLocaleDateString` on a date-only string — that shifts the day for visitors west of UTC.

**Tests:** `tests/*.test.mjs` import TypeScript sources directly; `tests/setup.mjs` teaches Node the `@/` alias and extensionless imports. Keep logic in `src/lib` (not `.tsx`) so it stays unit-testable; pages and components are covered by `tests/photo-api.integration.mjs`.

**Path alias:** `@/*` maps to `./src/*`.

**Images:** Remote images allowed from `images.unsplash.com` and the R2 public URL (configured in `next.config.ts`). Use `preload` (not the deprecated `priority`) for above-the-fold images. Build output is `standalone` mode for Docker compatibility.
