#!/bin/bash
set -euo pipefail

LOG="/var/log/portfolio-setup.log"
exec > >(tee -a "$LOG") 2>&1
echo "=== Portfolio setup started at $(date) ==="

# Install Node.js 20, git
dnf install -y nodejs20 npm git

# Clone the repo
git clone ${repo_url} /opt/portfolio
cd /opt/portfolio

# Install dependencies (including devDeps needed for build)
npm ci

# Build the Next.js app
npm run build

# Copy static assets into standalone output
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Create systemd service
cat > /etc/systemd/system/portfolio.service <<'UNIT'
[Unit]
Description=Next.js Portfolio
After=network.target

[Service]
Type=simple
User=nobody
WorkingDirectory=/opt/portfolio/.next/standalone
Environment=HOSTNAME=0.0.0.0
Environment=PORT=${app_port}
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

# Fix ownership so nobody can read the files
chown -R nobody:nobody /opt/portfolio

# Start the service
systemctl daemon-reload
systemctl enable --now portfolio.service

# Redirect port 80 -> app port so users can access via plain HTTP
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port ${app_port}

echo "=== Portfolio setup finished at $(date) ==="
