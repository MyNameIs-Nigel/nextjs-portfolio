# Nigel Smith — Photography Portfolio

A single-page photography portfolio built from scratch with Next.js, React, TypeScript, and Tailwind CSS. Deployed 24/7 on Vercel with a custom domain and SSL.

## Live Site

**[https://ndsironwood.com](https://ndsironwood.com)**

---

## Updating the Site

This project is connected to Vercel via GitHub. To update the live site:

```bash
git add .
git commit -m "your changes"
git push
```

That's it. Vercel automatically detects the push, rebuilds the app, and deploys the new version — typically within 30–60 seconds. Zero downtime, zero manual intervention.

---

## Running with Docker (Linux)

The included multi-stage `Dockerfile` produces a minimal production image (~150 MB) using Next.js standalone output.

### Prerequisites

- Docker installed ([install guide](https://docs.docker.com/engine/install/))
- Git installed

### Build and Run

```bash
# Clone the repository
git clone https://github.com/<your-username>/nextjs-portfolio.git
cd nextjs-portfolio

# Build the Docker image
docker build -t portfolio .

# Run the container
docker run -d -p 3000:3000 --name portfolio portfolio
```

The site is now available at `http://localhost:3000`.

### With Nginx Reverse Proxy

To serve the app on port 80/443 behind Nginx, point your Nginx config's `proxy_pass` to the container:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

This has been tested on AWS EC2 by cloning the repo, building the Docker image, and connecting it with Nginx.

### Useful Docker Commands

```bash
# Stop the container
docker stop portfolio

# Restart with latest changes
git pull
docker build -t portfolio .
docker stop portfolio && docker rm portfolio
docker run -d -p 3000:3000 --name portfolio portfolio
```

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 16 (App Router)           |
| UI          | React 19, TypeScript              |
| Styling     | Tailwind CSS 4                    |
| Animations  | Framer Motion                     |
| Deployment  | Vercel (primary), Docker (portable) |
| Domain/SSL  | Custom domain via Vercel           |

See [WRITEUP.md](WRITEUP.md) for a detailed project breakdown.
