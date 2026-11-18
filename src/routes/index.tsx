import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoldCalculator } from '@/components/site/gold-calculator'
import { PriceChart } from '@/components/site/price-chart'
import {
  FaqList,
  KaratTable,
  LinkGrid,
  RateHero,
  Section,
  SpotStrip,
  WeightTable,
  useAutoRefresh,
} from '@/components/site/rates'
import { CITY_PAGES, GUIDE_PAGES, HOME_FAQS, KARAT_PAGES, SITE } from '@/content/pages'
import { aedPerGram, formatMoney } from '@/lib/gold-math'
import { fetchHistory, fetchLiveRates } from '@/lib/prices.functions'
import { breadcrumbJsonLd, faqJsonLd, pageHead } from '@/lib/seo'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [snap, history] = await Promise.all([fetchLiveRates(), fetchHistory({ data: { days: 366 } })])
    return { snap, history }
  },
  head: ({ loaderData }) => {
    const g24 = loaderData ? formatMoney(aedPerGram(loaderData.snap.goldUsdOz, '24k')) : ''
    const g22 = loaderData ? formatMoney(aedPerGram(loaderData.snap.goldUsdOz, '22k')) : ''
    return pageHead({
      title: 'Gold Rate in UAE Today – Live Dubai Gold Price per Gram (24K, 22K, 21K, 18K)',
      description: loaderData
        ? `Live gold rate in UAE today: 24K ${g24}/g, 22K ${g22}/g. Dubai gold price per gram, tola & ounce in AED with a free gold calculator, updated every few minutes.`
        : SITE.description,
      path: '/',
      jsonLd: [faqJsonLd(HOME_FAQS), breadcrumbJsonLd([{ name: 'Gold rate UAE', path: '/' }])],
    })
  },
  component: Home,
})

function Home() {
  const { snap, history } = Route.useLoaderData()
  useAutoRefresh()

  return (
    <>
      <RateHero
        snap={snap}
        h1="Gold Rate in UAE Today"
        lead="Live gold price in Dubai and across the UAE for 24K, 22K, 21K and 18K gold — per gram, tola and ounce in dirhams. Updated every few minutes from the international spot market."
        focusKarat="24k"
      />
      <SpotStrip snap={snap} />

      <Section
        title="Today’s gold price in UAE by karat"
        description="UAE gold prices in AED for every common purity and weight. The same rate applies in Dubai, Abu Dhabi, Sharjah and all other emirates."
      >
        <KaratTable snap={snap} />
      </Section>

      <Section
        id="calculator"
        title="Gold calculator UAE"
        description="Work out the price of a gold chain, bangle or bar with making charges and 5% VAT — or what you’ll get for selling old gold."
      >
        <GoldCalculator goldUsdOz={snap.goldUsdOz} fx={snap.fx} />
        <Button asChild variant="link" className="mt-2 px-0">
          <Link to="/gold-calculator">
            <Calculator className="size-4" /> Open the full gold rate calculator
          </Link>
        </Button>
      </Section>

      <Section
        title="Gold price per gram, tola & ounce in AED"
        description="Quick reference for the most-searched weights, from 1 gram to 1 kilogram."
      >
        <WeightTable snap={snap} />
      </Section>

      <Section title="Gold price chart (UAE)" description="Daily 24K and 22K gold rate in AED per gram and spot gold in USD per ounce.">
        <PriceChart points={history} defaultRange="1m" />
        <Button asChild variant="link" className="mt-2 px-0">
          <Link to="/gold-price-chart">
            Gold rate history & daily table <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Section>

      <Section title="Gold rate across the UAE">
        <div className="space-y-8">
          <LinkGrid title="By emirate" pages={CITY_PAGES} />
          <LinkGrid title="By karat" pages={KARAT_PAGES} />
          <LinkGrid title="Guides & currency conversions" pages={GUIDE_PAGES} />
        </div>
      </Section>

      <Section title="How the UAE gold rate is calculated">
        <div className="prose-gold max-w-reading">
          <p>
            Gold is traded worldwide in US dollars per troy ounce. Because the UAE dirham has been pegged to the dollar at
            AED 3.6725 since 1997, the dirham gold price moves exactly in step with the international spot price.
          </p>
          <p>
            The 24 karat rate per gram is the spot price × 3.6725 ÷ 31.1035 (grams in a troy ounce). Lower karats are
            priced by their gold content: 22K is 91.6% of the 24K rate, 21K is 87.5% and 18K is 75%. Today that means 1
            gram of 22K gold is worth {formatMoney(aedPerGram(snap.goldUsdOz, '22k'))} before making charges.
          </p>
          <p>
            When you buy jewellery in Dubai or anywhere else in the UAE, the shop adds making charges for craftsmanship
            and 5% VAT. Investment gold — 24K bars and coins of at least 99% purity — is VAT-free. Use the calculator above
            to see the full price before you visit a store.
          </p>
        </div>
      </Section>

      <Section title="Frequently asked questions">
        <FaqList faqs={HOME_FAQS} />
      </Section>
    </>
  )
}
