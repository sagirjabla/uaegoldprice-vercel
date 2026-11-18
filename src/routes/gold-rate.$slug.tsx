import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { GoldCalculator } from '@/components/site/gold-calculator'
import {
  BAR_ROWS,
  FaqList,
  KaratTable,
  LinkGrid,
  RateHero,
  Section,
  SpotStrip,
  TOLA_ROWS,
  WeightTable,
  useAutoRefresh,
} from '@/components/site/rates'
import { CITY_PAGES, GUIDE_PAGES, KARAT_PAGES, landingBySlug, type LandingPage } from '@/content/pages'
import { aedPerGram, convertFromAed, formatMoney, karatById } from '@/lib/gold-math'
import { fetchLiveRates } from '@/lib/prices.functions'
import { breadcrumbJsonLd, faqJsonLd, pageHead } from '@/lib/seo'

export const Route = createFileRoute('/gold-rate/$slug')({
  loader: async ({ params }) => {
    const page = landingBySlug(params.slug)
    if (!page) throw notFound()
    const snap = await fetchLiveRates()
    return { slug: page.slug, snap }
  },
  head: ({ loaderData, params }) => {
    const page = landingBySlug(params.slug)
    if (!page || !loaderData) return {}
    const cur = page.currency ?? 'AED'
    const rate = formatMoney(convertFromAed(aedPerGram(loaderData.snap.goldUsdOz, page.focusKarat), cur, loaderData.snap.fx), cur)
    return pageHead({
      title: page.title,
      description: `${karatById(page.focusKarat).label} ${rate}/g today. ${page.description}`,
      path: `/gold-rate/${page.slug}`,
      jsonLd: [
        faqJsonLd(page.faqs),
        breadcrumbJsonLd([
          { name: 'Gold rate UAE', path: '/' },
          { name: page.h1.replace(' Today', ''), path: `/gold-rate/${page.slug}` },
        ]),
      ],
    })
  },
  component: LandingRoute,
})

function LandingRoute() {
  const { slug, snap } = Route.useLoaderData()
  useAutoRefresh()
  const page = landingBySlug(slug) as LandingPage
  const currency = page.currency ?? 'AED'
  const focus = karatById(page.focusKarat)
  const related =
    page.kind === 'city' ? CITY_PAGES : page.kind === 'karat' ? KARAT_PAGES : GUIDE_PAGES

  return (
    <>
      <RateHero
        snap={snap}
        h1={page.h1}
        lead={page.description}
        focusKarat={page.focusKarat}
        currency={currency}
      />
      <SpotStrip snap={snap} />

      <nav aria-label="Breadcrumb" className="mx-auto max-w-content px-4 pt-6 text-sm text-muted-foreground sm:px-6">
        <ol className="flex items-center gap-1">
          <li>
            <Link to="/" className="hover:text-foreground">Gold rate UAE</Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li aria-current="page" className="text-foreground">{page.h1.replace(' Today', '')}</li>
        </ol>
      </nav>

      <Section title={`About the ${page.h1.replace(' Today', '').replace('Gold Rate in ', 'gold rate in ')}`} className="pb-2">
        <div className="prose-gold max-w-reading">
          {page.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Section>

      {page.focusUnit === 'tola' ? (
        <Section title={`Gold price per tola${currency !== 'AED' ? ` in ${currency}` : ' in UAE'}`}>
          <WeightTable snap={snap} rows={TOLA_ROWS} currency={currency} />
        </Section>
      ) : null}

      {page.focusUnit === 'bar' ? (
        <Section title="24K gold bar prices in Dubai today" description="Gold content value at today’s live 24K rate, before dealer premium.">
          <WeightTable snap={snap} rows={BAR_ROWS} karats={['24k']} />
        </Section>
      ) : null}

      {page.focusUnit === 'ounce' ? (
        <Section title="Gold price per ounce today">
          <WeightTable
            snap={snap}
            rows={[
              { label: '1 troy ounce', grams: 31.1034768 },
              { label: '½ troy ounce', grams: 15.5517384 },
              { label: '¼ troy ounce', grams: 7.7758692 },
              { label: '10 troy ounces', grams: 311.034768 },
            ]}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            International spot: {formatMoney(snap.goldUsdOz, 'USD')} per ounce = {formatMoney(snap.goldUsdOz * 3.6725)} per ounce.
          </p>
        </Section>
      ) : null}

      <Section
        title={`${focus.label} gold price by weight${currency !== 'AED' ? ` in ${currency}` : ''}`}
        description={
          currency !== 'AED'
            ? `Converted at 1 AED = ${(snap.fx[currency] / 3.6725).toFixed(2)} ${currency}.`
            : undefined
        }
      >
        <WeightTable snap={snap} currency={currency} />
      </Section>

      <Section title={`All karats${page.kind === 'city' ? ` in ${page.nav}` : ''} today${currency !== 'AED' ? ` (${currency})` : ''}`}>
        <KaratTable snap={snap} currency={currency} />
      </Section>

      <Section
        title={page.kind === 'city' ? `Gold calculator for ${page.nav}` : 'Gold price calculator'}
        description="Add making charges and VAT to estimate the final price, or calculate what you’ll receive for old gold."
      >
        <GoldCalculator
          goldUsdOz={snap.goldUsdOz}
          fx={snap.fx}
          defaultKarat={page.focusKarat}
          defaultUnit={page.focusUnit === 'tola' ? 'tola' : page.focusUnit === 'ounce' ? 'ounce' : 'gram'}
        />
      </Section>

      <Section title="Frequently asked questions">
        <FaqList faqs={page.faqs} />
      </Section>

      <Section title="Related gold rates">
        <div className="space-y-8">
          <LinkGrid title="Also see" pages={related.filter((p) => p.slug !== page.slug)} />
          {page.kind !== 'karat' ? <LinkGrid title="By karat" pages={KARAT_PAGES} /> : <LinkGrid title="By emirate" pages={CITY_PAGES} />}
        </div>
      </Section>
    </>
  )
}
