import { Link } from '@tanstack/react-router'
import { CITY_PAGES, GUIDE_PAGES, KARAT_PAGES, SITE } from '@/content/pages'
import { Logo } from './site-header'

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-ink-foreground/65">
            {SITE.tagline}. Rates are indicative, derived from the international spot price at AED 3.6725 per USD.
          </p>
          <ul className="space-y-1.5 text-sm">
            <li><Link to="/gold-calculator" className="text-ink-foreground/80 hover:text-gold">Gold calculator UAE</Link></li>
            <li><Link to="/gold-price-chart" className="text-ink-foreground/80 hover:text-gold">Gold price chart & history</Link></li>
            <li><Link to="/silver-rate" className="text-ink-foreground/80 hover:text-gold">Silver rate in UAE</Link></li>
            <li><Link to="/about" className="text-ink-foreground/80 hover:text-gold">About & methodology</Link></li>
          </ul>
        </div>
        <FooterGroup title="Gold rate by emirate" pages={CITY_PAGES} />
        <FooterGroup title="Gold rate by karat" pages={KARAT_PAGES} />
        <FooterGroup title="Guides & conversions" pages={GUIDE_PAGES} />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-content px-4 py-6 text-xs text-ink-foreground/50 sm:px-6">
          © {new Date().getFullYear()} {SITE.name}. Prices are for information only and are not an offer to buy or sell. Jewellers add making charges and VAT; always confirm the final price in store.
        </p>
      </div>
    </footer>
  )
}

function FooterGroup({ title, pages }: { title: string; pages: { slug: string; h1: string }[] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold">{title}</p>
      <ul className="space-y-1.5 text-sm">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link to="/gold-rate/$slug" params={{ slug: p.slug }} className="text-ink-foreground/80 hover:text-gold">
              {p.h1.replace(' Today', '')}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
