import { createFileRoute } from '@tanstack/react-router'
import { LANDING_PAGES } from '@/content/pages'
import { canonical } from '@/lib/seo'

const STATIC_PATHS: { path: string; priority: string; freq: string }[] = [
  { path: '/', priority: '1.0', freq: 'hourly' },
  { path: '/gold-calculator', priority: '0.9', freq: 'daily' },
  { path: '/gold-price-chart', priority: '0.8', freq: 'daily' },
  { path: '/silver-rate', priority: '0.6', freq: 'daily' },
  { path: '/about', priority: '0.3', freq: 'monthly' },
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const lastmod = new Date().toISOString().slice(0, 10)
        const entries = [
          ...STATIC_PATHS,
          ...LANDING_PAGES.map((p) => ({
            path: `/gold-rate/${p.slug}`,
            priority: p.kind === 'city' || p.kind === 'karat' ? '0.9' : '0.8',
            freq: 'hourly',
          })),
        ]
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${canonical(e.path)}</loc><lastmod>${lastmod}</lastmod><changefreq>${e.freq}</changefreq><priority>${e.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>`
        return new Response(body, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
