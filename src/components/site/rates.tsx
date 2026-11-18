import { Link, useRouter } from '@tanstack/react-router'
import { ArrowDownRight, ArrowUpRight, Clock, Minus } from 'lucide-react'
import { useEffect } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Faq, LandingPage } from '@/content/pages'
import {
  GRAMS_PER_TROY_OUNCE,
  KARATS,
  MAIN_KARATS,
  WEIGHT_ROWS,
  aedPerGram,
  convertFromAed,
  formatMoney,
  karatById,
  type CurrencyCode,
  type KaratId,
} from '@/lib/gold-math'
import type { LiveSnapshot } from '@/lib/price-types'
import { cn } from '@/lib/utils'

/** Re-run route loaders every `ms` while the tab is visible. */
export function useAutoRefresh(ms = 90_000) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.invalidate()
    }, ms)
    return () => clearInterval(id)
  }, [router, ms])
}

export function formatUaeTime(iso: string) {
  return new Intl.DateTimeFormat('en-AE', {
    timeZone: 'Asia/Dubai',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatUaeDate(iso: string) {
  return new Intl.DateTimeFormat('en-AE', {
    timeZone: 'Asia/Dubai',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export function Change({ now, prev, className }: { now: number; prev: number | null; className?: string }) {
  if (!prev) return null
  const pct = ((now - prev) / prev) * 100
  const flat = Math.abs(pct) < 0.005
  const Icon = flat ? Minus : pct > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-sm font-semibold tabular',
        flat ? 'text-muted-foreground' : pct > 0 ? 'text-up' : 'text-down',
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
      {pct > 0 ? '+' : ''}
      {pct.toFixed(2)}%<span className="sr-only"> versus yesterday</span>
    </span>
  )
}

interface HeroProps {
  snap: LiveSnapshot
  h1: string
  lead: string
  focusKarat?: KaratId
  currency?: CurrencyCode
  eyebrow?: string
}

export function RateHero({ snap, h1, lead, focusKarat = '24k', currency = 'AED', eyebrow }: HeroProps) {
  const focus = karatById(focusKarat)
  const perGram = aedPerGram(snap.goldUsdOz, focusKarat)
  const prevPerGram = snap.prevGoldUsdOz ? aedPerGram(snap.prevGoldUsdOz, focusKarat) : null
  return (
    <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
      <img
        src="/img/hero-gold-1376.webp"
        srcSet="/img/hero-gold-800.webp 800w, /img/hero-gold-1376.webp 1376w"
        sizes="100vw"
        alt=""
        aria-hidden
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-right opacity-60"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/30" />
      <div className="mx-auto max-w-content px-4 pt-10 pb-12 sm:px-6 md:pt-14 md:pb-16">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-gold" />
          </span>
          {eyebrow ?? 'Live'} · {formatUaeDate(snap.updatedAt)}
        </p>
        <h1 className="max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">{h1}</h1>
        <p className="mt-4 max-w-2xl text-base text-ink-foreground/75 sm:text-lg">{lead}</p>

        <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <p className="text-sm text-ink-foreground/60">
              {focus.label} gold per gram{currency !== 'AED' ? ` in ${currency}` : ''}
            </p>
            <p className="font-display text-5xl font-semibold text-gold tabular sm:text-6xl">
              {formatMoney(convertFromAed(perGram, currency, snap.fx), currency)}
            </p>
          </div>
          <div className="pb-2">
            <Change now={perGram} prev={prevPerGram} className="text-base" />
            <p className="mt-1 flex items-center gap-1 text-xs text-ink-foreground/55">
              <Clock className="size-3.5" aria-hidden />
              Updated {formatUaeTime(snap.updatedAt)} UAE{snap.stale ? ' · last known rate' : ''}
            </p>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MAIN_KARATS.map((id) => {
            const k = karatById(id)
            const g = aedPerGram(snap.goldUsdOz, id)
            const pg = snap.prevGoldUsdOz ? aedPerGram(snap.prevGoldUsdOz, id) : null
            return (
              <li
                key={id}
                className={cn(
                  'rounded-xl border p-4 backdrop-blur-sm',
                  id === focusKarat ? 'border-gold/60 bg-gold/15' : 'border-white/10 bg-white/5',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-semibold">{k.label}</span>
                  <Change now={g} prev={pg} className="text-xs" />
                </div>
                <p className="mt-1 text-2xl font-bold tabular">
                  {formatMoney(convertFromAed(g, currency, snap.fx), currency)}
                </p>
                <p className="text-xs text-ink-foreground/55">per gram · {k.note}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function Section({
  title,
  id,
  children,
  description,
  className,
}: {
  title: string
  id?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('mx-auto max-w-content px-4 py-10 sm:px-6', className)}>
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      {description ? <p className="mt-2 max-w-reading text-muted-foreground">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function TableFrame({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-xl border bg-card shadow-sm">{children}</div>
}

/** Karat rows × common weight columns. */
export function KaratTable({ snap, currency = 'AED' }: { snap: LiveSnapshot; currency?: CurrencyCode }) {
  const cols = [
    { label: '1 gram', g: 1 },
    { label: '8 grams', g: 8 },
    { label: '10 grams', g: 10 },
    { label: '1 tola', g: 11.6638 },
    { label: '1 ounce', g: GRAMS_PER_TROY_OUNCE },
  ]
  const fmt = (aed: number) => formatMoney(convertFromAed(aed, currency, snap.fx), currency)
  return (
    <TableFrame>
      <Table className="tabular">
        <TableHeader>
          <TableRow className="bg-muted/60">
            <TableHead className="font-semibold">Karat</TableHead>
            {cols.map((c) => (
              <TableHead key={c.label} className="text-right font-semibold">
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {KARATS.map((k) => {
            const g = aedPerGram(snap.goldUsdOz, k.id)
            return (
              <TableRow key={k.id}>
                <TableCell className="font-semibold">
                  {k.label} <span className="font-normal text-muted-foreground">({(k.purity * 100).toFixed(1)}%)</span>
                </TableCell>
                {cols.map((c) => (
                  <TableCell key={c.label} className="text-right">
                    {fmt(g * c.g)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableFrame>
  )
}

/** Weight rows × main karat columns. */
export function WeightTable({
  snap,
  rows = WEIGHT_ROWS,
  currency = 'AED',
  karats = MAIN_KARATS,
}: {
  snap: LiveSnapshot
  rows?: { label: string; grams: number }[]
  currency?: CurrencyCode
  karats?: KaratId[]
}) {
  return (
    <TableFrame>
      <Table className="tabular">
        <TableHeader>
          <TableRow className="bg-muted/60">
            <TableHead className="font-semibold">Weight</TableHead>
            {karats.map((id) => (
              <TableHead key={id} className="text-right font-semibold">
                {karatById(id).label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell className="font-medium">{r.label}</TableCell>
              {karats.map((id) => (
                <TableCell key={id} className="text-right">
                  {formatMoney(convertFromAed(aedPerGram(snap.goldUsdOz, id) * r.grams, currency, snap.fx), currency)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableFrame>
  )
}

export const TOLA_ROWS = [1, 2, 3, 5, 10].map((n) => ({
  label: `${n} tola (${(n * 11.6638).toFixed(2)} g)`,
  grams: n * 11.6638,
}))

export const BAR_ROWS = [
  { label: '1 gram bar', grams: 1 },
  { label: '2.5 gram bar', grams: 2.5 },
  { label: '5 gram bar', grams: 5 },
  { label: '10 gram bar', grams: 10 },
  { label: '20 gram bar', grams: 20 },
  { label: '1 ounce bar (31.10 g)', grams: GRAMS_PER_TROY_OUNCE },
  { label: '50 gram bar', grams: 50 },
  { label: '100 gram bar', grams: 100 },
  { label: '10 tola bar (116.64 g)', grams: 116.638 },
  { label: '250 gram bar', grams: 250 },
  { label: '1 kilogram bar', grams: 1000 },
]

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <Accordion type="single" collapsible className="max-w-reading rounded-xl border bg-card px-5">
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function LinkGrid({ title, pages }: { title: string; pages: LandingPage[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link
              to="/gold-rate/$slug"
              params={{ slug: p.slug }}
              className="block rounded-lg border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:bg-accent motion-reduce:transition-none"
            >
              {p.h1.replace(' Today', '')}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SpotStrip({ snap }: { snap: LiveSnapshot }) {
  const items = [
    { label: 'Spot gold (USD/oz)', value: formatMoney(snap.goldUsdOz, 'USD') },
    { label: 'Spot gold (AED/oz)', value: formatMoney(snap.goldUsdOz * 3.6725, 'AED') },
    snap.dayHigh ? { label: 'Today’s high (USD/oz)', value: formatMoney(snap.dayHigh, 'USD') } : null,
    snap.dayLow ? { label: 'Today’s low (USD/oz)', value: formatMoney(snap.dayLow, 'USD') } : null,
    snap.silverUsdOz ? { label: 'Silver (AED/g)', value: formatMoney((snap.silverUsdOz * 3.6725) / GRAMS_PER_TROY_OUNCE, 'AED') } : null,
  ].filter(Boolean) as { label: string; value: string }[]
  return (
    <div className="border-b bg-card">
      <dl className="mx-auto flex max-w-content flex-wrap gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
        {items.map((it) => (
          <div key={it.label}>
            <dt className="text-xs text-muted-foreground">{it.label}</dt>
            <dd className="font-semibold tabular">{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
