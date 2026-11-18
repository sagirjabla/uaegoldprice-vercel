import { createFileRoute } from '@tanstack/react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FaqList, Section, formatUaeTime, useAutoRefresh } from '@/components/site/rates'
import type { Faq } from '@/content/pages'
import { AED_PER_USD, GRAMS_PER_TROY_OUNCE, formatMoney } from '@/lib/gold-math'
import { fetchLiveRates } from '@/lib/prices.functions'
import { breadcrumbJsonLd, faqJsonLd, pageHead } from '@/lib/seo'

const FAQS: Faq[] = [
  { q: 'What is the silver rate in UAE today?', a: 'The live silver rate per gram and per kilogram in AED is shown at the top of this page, based on the international spot price.' },
  { q: 'Which silver purity is sold in Dubai?', a: 'Investment bars are usually 999 fine silver. Jewellery and cutlery are typically 925 sterling silver (92.5% pure).' },
  { q: 'Is VAT charged on silver in the UAE?', a: 'Investment silver of 99% purity or more is zero-rated; silver jewellery and other items carry 5% VAT.' },
]

const ROWS = [
  { label: '1 gram', g: 1 },
  { label: '10 grams', g: 10 },
  { label: '1 tola', g: 11.6638 },
  { label: '1 troy ounce', g: GRAMS_PER_TROY_OUNCE },
  { label: '100 grams', g: 100 },
  { label: '1 kilogram', g: 1000 },
]

export const Route = createFileRoute('/silver-rate')({
  loader: () => fetchLiveRates(),
  head: () =>
    pageHead({
      title: 'Silver Rate in UAE Today – Silver Price per Gram & Kg in Dubai (AED)',
      description: 'Live silver price in Dubai and UAE today: 999 and 925 silver rate per gram, tola, ounce and 1 kg in AED.',
      path: '/silver-rate',
      jsonLd: [faqJsonLd(FAQS), breadcrumbJsonLd([{ name: 'Gold rate UAE', path: '/' }, { name: 'Silver rate', path: '/silver-rate' }])],
    }),
  component: SilverPage,
})

function SilverPage() {
  const snap = Route.useLoaderData()
  useAutoRefresh()
  const perGram = snap.silverUsdOz ? (snap.silverUsdOz * AED_PER_USD) / GRAMS_PER_TROY_OUNCE : null
  return (
    <>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
          <h1 className="text-4xl font-semibold sm:text-5xl">Silver Rate in UAE Today</h1>
          <p className="mt-3 max-w-2xl text-ink-foreground/75">Live silver price in Dubai and across the UAE in dirhams.</p>
          {perGram ? (
            <div className="mt-6">
              <p className="text-sm text-ink-foreground/60">999 silver per gram</p>
              <p className="font-display text-5xl font-semibold text-gold tabular">{formatMoney(perGram)}</p>
              <p className="mt-1 text-xs text-ink-foreground/55">Updated {formatUaeTime(snap.updatedAt)} UAE · Spot {formatMoney(snap.silverUsdOz ?? 0, 'USD')}/oz</p>
            </div>
          ) : (
            <p className="mt-6 rounded-lg bg-white/5 p-4 text-sm">The live silver price is temporarily unavailable. Please check back in a few minutes.</p>
          )}
        </div>
      </section>
      {perGram ? (
        <Section title="Silver price by weight">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table className="tabular">
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead className="font-semibold">Weight</TableHead>
                  <TableHead className="text-right font-semibold">999 fine silver</TableHead>
                  <TableHead className="text-right font-semibold">925 sterling silver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((r) => (
                  <TableRow key={r.label}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell className="text-right">{formatMoney(perGram * r.g * 0.999)}</TableCell>
                    <TableCell className="text-right">{formatMoney(perGram * r.g * 0.925)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>
      ) : null}
      <Section title="Silver rate FAQs">
        <FaqList faqs={FAQS} />
      </Section>
    </>
  )
}
