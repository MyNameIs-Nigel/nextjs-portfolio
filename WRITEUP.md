# Project Writeup — Photography Portfolio Web App

**Author:** Nigel Smith
**Live URL:** [https://ndsironwood.com](https://ndsironwood.com)
**Source:** GitHub → auto-deployed via Vercel
**Monthly Cost:** $0

---

## What This Project Proves

This is not just a photography portfolio. It is a full-stack web application built from scratch by a Computer Science / Cybersecurity student to demonstrate the ability to design, develop, deploy, and maintain a production-grade web app — at zero cost.

The site is live 24/7 on a custom domain with SSL, automatically deploys on every `git push`, and can be containerized and moved to any Linux server in minutes. It was built without templates or website builders — every component, animation, and layout decision was written by hand.

---

## Tech Stack

| Category       | Choice                     | Why It Matters                                                  |
|----------------|----------------------------|-----------------------------------------------------------------|
| **Framework**  | Next.js 16 (App Router)    | Industry-standard React framework used by Vercel, Netflix, TikTok |
| **Language**   | TypeScript                 | Type safety — catches bugs at compile time, not in production    |
| **UI Library** | React 19                   | The dominant front-end library; component-based architecture     |
| **Styling**    | Tailwind CSS 4             | Utility-first CSS — fast iteration, no dead CSS in production    |
| **Animation**  | Framer Motion              | Production-grade animation library for React                     |
| **Deployment** | Vercel + Docker            | Cloud-native CI/CD *and* portable containerization               |
| **Analytics**  | Vercel Analytics           | Built-in traffic and performance monitoring                      |

---

## Key Features

### Responsive Single-Page App
The entire site is a single smooth-scrolling page with anchor-based navigation. The navbar detects scroll position and adapts its styling — transparent over the hero video, opaque with a blur effect when scrolling content. On mobile, it collapses into an animated full-screen hamburger menu.

### Filterable Masonry Gallery
The portfolio section displays 18 photographs in a responsive masonry grid (1 column on mobile, 2 on tablet, 3 on desktop). Users can filter by category — Portrait, Landscape, Automotive, Film, Architecture — with instant filtering. Each image uses optimized thumbnails for fast page loads and opens a full-resolution lightbox with animated transitions.

### Image Optimization
Next.js `Image` component handles lazy loading, responsive `srcset` generation, and format optimization automatically. Thumbnails are stored separately from originals to keep initial page weight low while still delivering full-resolution images in the lightbox.

### Scroll-Triggered Animations
Every section uses `useInView` from Framer Motion to trigger entrance animations only when the user scrolls to that content. The hero section staggers its text and CTA reveals. Gallery cards fade in with staggered delays. The About and Contact sections slide in on scroll. This creates a polished, modern feel without relying on heavy animation libraries.

### Full-Screen Video Hero
The landing section features a looping background video with a gradient overlay and animated text. It gracefully falls back to a static image on slow connections or unsupported browsers.

### Contact Form
A styled contact form with fields for name, email, project type, and message. Client-side validation and a success state are implemented.

---

## Deployment & Infrastructure

### Vercel (Primary — $0/month)
- Connected directly to the GitHub repository
- Every push to `main` triggers an automatic build and deployment
- Custom domain (`ndsironwood.com`) with automatic SSL certificate provisioning
- Global CDN edge network for fast load times
- Zero-downtime deployments

### Docker (Portable)
The project includes a multi-stage `Dockerfile` that produces a minimal production image:

1. **Stage 1** — Install dependencies (`npm ci`)
2. **Stage 2** — Build the Next.js app
3. **Stage 3** — Copy only the standalone output into a clean Alpine image

This means the app can be deployed anywhere Docker runs: AWS EC2, DigitalOcean, a Raspberry Pi, a home server — without touching the source code. This has been proven by deploying to an EC2 instance, building the image, and serving it through Nginx.

### Next.js Standalone Output
The `next.config.ts` sets `output: 'standalone'`, which bundles the production server and all dependencies into a self-contained folder. This is what makes the Docker image small and the deployment portable — no need to install `node_modules` on the server.

---

## Skills Demonstrated

| Skill                         | How It's Applied                                                |
|-------------------------------|-----------------------------------------------------------------|
| **Front-End Development**     | React components, state management, responsive design           |
| **TypeScript**                | Typed props, interfaces for data models, compile-time safety    |
| **CSS / UI Design**           | Tailwind utility classes, custom theme, masonry layout, responsive breakpoints |
| **Animation / UX**            | Scroll-triggered reveals, lightbox transitions, staggered animations |
| **Version Control (Git)**     | GitHub-based workflow with CI/CD integration                    |
| **CI/CD**                     | Automatic build-and-deploy pipeline via Vercel on every push    |
| **Containerization (Docker)** | Multi-stage Dockerfile, standalone builds, Alpine-based images  |
| **Cloud Infrastructure**      | EC2 deployment, Nginx reverse proxy, DNS + SSL configuration    |
| **Web Performance**           | Image optimization, lazy loading, CDN delivery, minimal bundle  |
| **Networking / Security**     | SSL/TLS certificates, domain configuration, HTTPS enforcement   |

---

## Cost Breakdown

| Resource                | Cost      | Notes                                      |
|-------------------------|-----------|--------------------------------------------|
| Vercel Hosting          | $0        | Hobby tier — generous for personal projects |
| GitHub Repository       | $0        | Free for public and private repos           |
| SSL Certificate         | $0        | Auto-provisioned by Vercel                  |
| Domain (ndsironwood.com)| ~$10/year | Only recurring cost (optional — Vercel provides a free `.vercel.app` subdomain) |
| Docker / EC2 (demo)     | $0        | Free-tier eligible; used for proof of concept |

**Estimated monthly upkeep: $0**
The only cost is the optional custom domain, which runs roughly $10/year.

---

## Architecture at a Glance

```
User visits ndsironwood.com
        │
        ▼
   Vercel CDN (edge network, SSL)
        │
        ▼
   Next.js App (server-rendered layout, client-side interactivity)
        │
        ├── Navbar ── scroll-aware, mobile hamburger menu
        ├── Hero ──── full-screen video, animated text, CTAs
        ├── Portfolio ── masonry grid, category filters, lightbox
        ├── About ──── profile image, bio, stats
        ├── Contact ── styled form, social links
        └── Footer
```

Alternatively, the same app can run as a Docker container behind Nginx on any server — same code, same result, different infrastructure.

---

## Summary

This project demonstrates that a CS/Cybersecurity student can independently:

- Design and build a polished, production-ready web application
- Write clean, typed, component-based code following modern conventions
- Deploy it to the public internet with SSL, a custom domain, and zero downtime
- Containerize it for portability across any infrastructure
- Maintain it with a single `git push`
- Do all of this for $0/month

The photography is the content. The engineering is the point.
