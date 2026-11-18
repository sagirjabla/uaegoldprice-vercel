import { createFileRoute } from '@tanstack/react-router'
import { GoldCalculator } from '@/components/site/gold-calculator'
import { FaqList, Section, formatUaeTime, useAutoRefresh } from '@/components/site/rates'
import type { Faq } from '@/content/pages'
import { KARATS, aedPerGram, formatMoney } from '@/lib/gold-math'
import { fetchLiveRates } from '@/lib/prices.functions'
import { breadcrumbJsonLd, faqJsonLd, pageHead } from '@/lib/seo'

const FAQS: Faq[] = [
  {
    q: 'How do I calculate the price of gold jewellery in the UAE?',
    a: 'Price = (weight in grams × today’s rate for the karat) + making charges, then add 5% VAT. For example, a 10 g 22K chain at AED 15/g making is 10 × the 22K rate + AED 150, plus VAT.',
  },
  {
    q: 'How do I calculate the value of 18K, 14K or 10K gold?',
    a: 'Multiply the 24K rate by the purity: 18K = 75%, 14K = 58.5%, 10K = 41.7%, 9K = 37.5%. Select the karat in the calculator and it does this automatically.',
  },
  {
    q: 'How much will a shop pay for my old gold?',
    a: 'UAE buyers usually pay the day’s rate for your karat minus a deduction of around 2–10% for melting and refining. Use the “Selling old gold” tab to estimate your payout.',
  },
  {
    q: 'How many grams are in a tola, sovereign and ounce?',
    a: '1 tola = 11.6638 g, 1 sovereign (pavan) = 8 g and 1 troy ounce = 31.1035 g. Choose any of these units in the calculator.',
  },
  {
    q: 'Can I see the result in Indian or Pakistani rupees?',
    a: 'Yes. Use “Show result in” to convert the total into INR, PKR, PHP, BDT, USD and other currencies at live exchange rates.',
  },
]

export const Route = createFileRoute('/gold-calculator')({
  loader: () => fetchLiveRates(),
  head: () =>
    pageHead({
      title: 'Gold Calculator UAE – Gold Rate & Price Calculator with Making Charges',
      description:
        'Free UAE gold calculator: work out the price of 24K, 22K, 21K, 18K, 14K and 10K gold by gram, tola or ounce, with making charges, 5% VAT and old-gold selling value.',
      path: '/gold-calculator',
      jsonLd: [
        faqJsonLd(FAQS),
        breadcrumbJsonLd([
          { name: 'Gold rate UAE', path: '/' },
          { name: 'Gold calculator', path: '/gold-calculator' },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'UAE Gold Calculator',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
        },
      ],
    }),
  component: CalculatorPage,
})

function CalculatorPage() {
  const snap = Route.useLoaderData()
  useAutoRefresh()
  return (
    <>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
          <h1 className="text-4xl font-semibold sm:text-5xl">Gold Calculator UAE</h1>
          <p className="mt-3 max-w-2xl text-ink-foreground/75">
            Calculate the price of gold in Dubai and the UAE by weight and karat — including making charges and VAT — or
            estimate the value of gold you want to sell. Uses the live rate, updated {formatUaeTime(snap.updatedAt)} UAE.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm tabular">
            {KARATS.slice(0, 4).map((k) => (
              <li key={k.id} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                {k.label} <span className="font-semibold text-gold">{formatMoney(aedPerGram(snap.goldUsdOz, k.id))}/g</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="mx-auto -mt-2 max-w-content px-4 pt-8 sm:px-6">
        <GoldCalculator goldUsdOz={snap.goldUsdOz} fx={snap.fx} />
      </div>

      <Section title="How the gold calculator works">
        <div className="prose-gold max-w-reading">
          <p>
            The calculator starts from the live 24 karat rate per gram in dirhams and multiplies it by the purity of the
            karat you choose — 99.9% for 24K, 91.6% for 22K, 87.5% for 21K, 75% for 18K, 58.5% for 14K and 41.7% for 10K.
            That gives the value of the pure gold in your piece.
          </p>
          <p>
            Making charges are then added either per gram or as a percentage. Plain chains and bangles in UAE souks often
            start at around AED 8–20 per gram, while designer or diamond jewellery can carry 15–30% or more. Finally, 5% VAT
            is applied. Investment-grade bars and coins are VAT-free, so pick “No VAT” for those.
          </p>
        </div>
      </Section>

      <Section title="Gold calculator FAQs">
        <FaqList faqs={FAQS} />
      </Section>
    </>
  )
}
