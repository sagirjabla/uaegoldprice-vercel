# UAE Gold Price

A fast, SEO-focused website for the **live gold rate in Dubai and the UAE**, with a full gold price calculator. It targets the search clusters found in Google Keyword Planner research: "gold rate in Dubai today", "22K / 24K gold price in UAE", "gold price per gram / tola / ounce", emirate-specific searches (Abu Dhabi, Sharjah, Ajman…), "gold calculator UAE", gold price charts, and Dubai gold rates in INR and PKR.

## Pages

| URL | Purpose |
| --- | --- |
| `/` | Live UAE gold rate (24K/22K/21K/18K), karat × weight tables, calculator, chart, FAQs |
| `/gold-calculator` | Jewellery price calculator (making charges, VAT, 12 currencies) and old-gold selling value |
| `/gold-price-chart` | Interactive chart (7D–1Y) and 30-day daily rate table |
| `/silver-rate` | Silver price in UAE (999 & 925) |
| `/gold-rate/<slug>` | 18 keyword landing pages: 8 emirates, 4 karats, tola, ounce, gold bars, INR, PKR |
| `/about` | Methodology |
| `/sitemap.xml`, `/robots.txt` | Search engine discovery |

## How prices work

- Live spot gold & silver (USD/oz) from gold-api.com, cached ~60 s per server instance.
- AED = USD × 3.6725 (the dirham peg); per gram = ÷ 31.1035; karats priced by purity.
- FX for INR/PKR/etc. from open.er-api.com, cached 6 h.
- Every page request and a Vercel Cron job record the price into **Netlify Database** as a daily open/high/low/close. On first run, a year of daily history is seeded from public COMEX futures closes so the chart is populated immediately.
- Pages are server-rendered and cached on Vercel's CDN for 2 minutes with stale-while-revalidate, and auto-refresh in the browser.

## Tech

TanStack Start (React 19, SSR) · Tailwind CSS 4 · shadcn/ui · Neon Postgres with Drizzle ORM · Vercel Cron · Nitro (Vercel preset).

## Deploy on Vercel

1. Push to GitHub and import the repo in Vercel (framework preset: **Other** / auto-detected; build command `pnpm build`).
2. Vercel project → **Storage** → add **Neon** (Postgres). This adds `DATABASE_URL` automatically.
3. Add env vars: `CRON_SECRET` (any random string) and `VITE_SITE_URL` (your public URL, no trailing slash).
4. Redeploy. The `daily_prices` table is created automatically on first request.

## Run locally

```bash
pnpm install
cp .env.example .env   # fill DATABASE_URL (optional: site still renders without it)
pnpm dev
```

## Adding a landing page

Add an entry to `LANDING_PAGES` in `src/content/pages.ts`. The route, sitemap, footer and internal link grids pick it up automatically.

## Ideas for next steps

- Set the production domain in `SITE.url` (`src/content/pages.ts`) and `public/robots.txt`, then submit the sitemap in Google Search Console.
- Add an Arabic version (`/ar/…`) for Arabic-language searches.
- Add a blog/guides section (e.g. "best time to buy gold in Dubai", "gold souk guide") for long-tail keywords.
