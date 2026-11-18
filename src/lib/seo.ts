import { SITE } from '@/content/pages'
import type { Faq } from '@/content/pages'

export function canonical(path: string) {
  return `${SITE.url}${path === '/' ? '' : path}`
}

export function ogImage() {
  return `${SITE.url}/img/og-gold.jpg`
}

/** Standard per-page meta: title, description, canonical and social tags. */
export function pageHead(opts: {
  title: string
  description: string
  path: string
  jsonLd?: object[]
}) {
  const url = canonical(opts.path)
  return {
    meta: [
      { title: opts.title },
      { name: 'description', content: opts.description },
      { property: 'og:title', content: opts.title },
      { property: 'og:description', content: opts.description },
      { property: 'og:url', content: url },
      { name: 'twitter:title', content: opts.title },
      { name: 'twitter:description', content: opts.description },
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: (opts.jsonLd ?? []).map((d) => ({
      type: 'application/ld+json',
      children: JSON.stringify(d),
    })),
  }
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: canonical(it.path),
    })),
  }
}
