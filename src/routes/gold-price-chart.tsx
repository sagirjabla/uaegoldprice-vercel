import { createFileRoute } from '@tanstack/react-router'
import { PriceChart } from '@/components/site/price-chart'
import { FaqList, Section, useAutoRefresh } from '@/components/site/rates'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Faq } from '@/content/pages'
import { MAIN_KARATS, aedPerGram, formatMoney, formatNumber, karatById } from '@/lib/gold-math'
import { fetchHistory } from '@/lib/prices.functions'
import { breadcrumbJsonLd, faqJsonLd, pageHead } from '@/lib/seo'

const FAQS: Faq[] = [
  { q: 'Where does the gold price history come from?', a: 'We record the live international spot price throughout every UAE day and keep the daily closing rate. Earlier history is seeded from public COMEX gold futures closes, which track spot closely.' },
  { q: 'Why does the UAE gold chart look the same as the global chart?', a: 'The dirham is pegged to the US dollar, so the AED gold price moves exactly with the international price in dollars.' },
  { q: 'What was the gold rate in UAE in the last 6 months?', a: 'Choose the 6M range on the chart to see the 24K or 22K gold rate per gram over the last six months, and hover to read any day’s rate.' },
]

export const Route = createFileRoute('/gold-price-chart')({
  loader: () => fetchHistory({ data: { days: 366 } }),
  head: () =>
    pageHead({
      title: 'Gold Price Chart UAE – Live Gold Rate History in AED (24K, 22K)',
      description: 'Gold price chart for Dubai and the UAE: 24K and 22K gold rate history per gram in AED and spot gold in USD over 7 days, 1, 3, 6 and 12 months.',
      path: '/gold-price-chart',
      jsonLd: [faqJsonLd(FAQS), breadcrumbJsonLd([{ name: 'Gold rate UAE', path: '/' }, { name: 'Gold price chart', path: '/gold-price-chart' }])],
    }),
  component: ChartPage,
})

function ChartPage() {
  const history = Route.useLoaderData()
  useAutoRefresh(300_000)
  const recent = [...history].reverse().slice(0, 30)
  return (
    <>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
          <h1 className="text-4xl font-semibold sm:text-5xl">Gold Price Chart & History (UAE)</h1>
          <p className="mt-3 max-w-2xl text-ink-foreground/75">
            Track how the gold rate in Dubai and the UAE has moved — daily 24K and 22K prices per gram in dirhams and the
            international spot price per ounce.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-content px-4 pt-8 sm:px-6">
        <PriceChart points={history} />
      </div>

      <Section title="Gold rate in UAE – last 30 days" description="Daily closing rate per gram in AED (UAE time).">
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Daily rates are being collected and will appear here shortly.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table className="tabular">
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead className="font-semibold">Date</TableHead>
                  {MAIN_KARATS.map((k) => (
                    <TableHead key={k} className="text-right font-semibold">{karatById(k).label} /g</TableHead>
                  ))}
                  <TableHead className="text-right font-semibold">Spot USD/oz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((p) => (
                  <TableRow key={p.day}>
                    <TableCell className="font-medium">
                      {new Date(`${p.day}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                    </TableCell>
                    {MAIN_KARATS.map((k) => (
                      <TableCell key={k} className="text-right">{formatMoney(aedPerGram(p.gold, k))}</TableCell>
                    ))}
                    <TableCell className="text-right">${formatNumber(p.gold)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <Section title="Gold chart FAQs">
        <FaqList faqs={FAQS} />
      </Section>
    </>
  )
}
