# ❄️ Snowdesk

**Live snow conditions for BC ski resorts — updated every 30 minutes.**

![Snowdesk](https://img.shields.io/badge/status-live-brightgreen) ![Resorts](https://img.shields.io/badge/resorts-5-blue) ![Cost](https://img.shields.io/badge/hosting-$0/mo-purple)

## 🏔️ Features

- **Real-time snow data** — base depth, 24h/48h/7-day snowfall, season totals
- **Lift & trail status** — see what's open at a glance
- **Auto-refresh** — scrapers run every 30 minutes via GitHub Actions
- **Canvas snowfall** — realistic animated snow with depth layers & wind
- **Responsive** — works great on desktop and mobile
- **$0 hosting** — GitHub Actions + GitHub Pages + Vercel

## 🎿 Supported Resorts

| Resort | Location |
|--------|----------|
| Whistler Blackcomb | Whistler, BC |
| Cypress Mountain | North Vancouver, BC |
| Grouse Mountain | North Vancouver, BC |
| Mt. Seymour | North Vancouver, BC |
| Sun Peaks | Sun Peaks, BC |

> More resorts coming soon!

## 🏗️ Architecture

```
GitHub Actions (cron every 30 min)
  └─► Puppeteer scrapers
      └─► data/resorts.json
          └─► GitHub Pages (static JSON API)

Vercel
  └─► React + Vite client
      └─► fetches from GitHub Pages
```

## 🚀 Local Development

### Server

```bash
cd server
npm install
node index.js
```

Runs on `http://localhost:3002`. Scrapes all resorts on startup and every 30 min.

### Client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5174`. Fetches data from the local server.

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS |
| Scrapers | Node.js, Puppeteer |
| Data API | GitHub Pages (static JSON) |
| CI/CD | GitHub Actions |
| Hosting | Vercel (client), GitHub Pages (data) |

## 📄 License

MIT
