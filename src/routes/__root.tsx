import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NotFoundPage } from '@/components/error-pages'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SITE } from '@/content/pages'
import { ogImage } from '@/lib/seo'

import '../styles.css'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: 'en-AE',
}

export const Route = createRootRoute({
  // Prices change every minute: let the CDN serve a cached page briefly and
  // refresh it in the background, while browsers always revalidate.
  headers: () => ({
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Vercel-CDN-Cache-Control': 'max-age=120, stale-while-revalidate=600',
  }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${SITE.name} – Gold Rate Today in UAE & Dubai` },
      { name: 'description', content: SITE.description },
      { name: 'theme-color', content: '#14161d' },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_AE' },
      { property: 'og:image', content: ogImage() },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: ogImage() },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'alternate icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap',
      },
    ],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(websiteJsonLd) }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AE">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </TooltipProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
