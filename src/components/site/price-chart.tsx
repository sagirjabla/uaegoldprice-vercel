import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { aedPerGram, formatMoney, type KaratId } from '@/lib/gold-math'
import type { HistoryPoint } from '@/lib/price-types'
import { cn } from '@/lib/utils'

export const RANGES = [
  { id: '7d', label: '7D', days: 7 },
  { id: '1m', label: '1M', days: 31 },
  { id: '3m', label: '3M', days: 92 },
  { id: '6m', label: '6M', days: 183 },
  { id: '1y', label: '1Y', days: 366 },
] as const

const METRICS = [
  { id: '24k', label: '24K AED/g' },
  { id: '22k', label: '22K AED/g' },
  { id: 'usd', label: 'Spot USD/oz' },
] as const
type MetricId = (typeof METRICS)[number]['id']

const H = 300
const PAD = { top: 16, right: 16, bottom: 28, left: 64 }

function fmtDay(day: string, withYear = false) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  })
}

export function valueFor(p: HistoryPoint, metric: MetricId) {
  return metric === 'usd' ? p.gold : aedPerGram(p.gold, metric as KaratId)
}

export function PriceChart({ points, defaultRange = '6m' }: { points: HistoryPoint[]; defaultRange?: (typeof RANGES)[number]['id'] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>(defaultRange)
  const [metric, setMetric] = useState<MetricId>('24k')
  const [hover, setHover] = useState<number | null>(null)
  const [width, setWidth] = useState(800)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(320, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const data = useMemo(() => {
    const days = RANGES.find((r) => r.id === range)?.days ?? 183
    const lastDay = points[points.length - 1]?.day
    if (!lastDay) return []
    const cutoff = new Date(Date.parse(`${lastDay}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10)
    return points.filter((p) => p.day >= cutoff)
  }, [points, range])

  const cur = metric === 'usd' ? 'USD' : 'AED'
  const values = data.map((p) => valueFor(p, metric))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || max * 0.01 || 1
  const lo = min - span * 0.08
  const hi = max + span * 0.08
  const innerW = width - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * innerH
  const path = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const area = data.length > 1 ? `${path}L${x(data.length - 1)},${PAD.top + innerH}L${x(0)},${PAD.top + innerH}Z` : ''
  const ticks = Array.from({ length: 4 }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / 4)
  const xTicks = data.length > 1 ? [0, Math.floor((data.length - 1) / 2), data.length - 1] : [0]

  const first = values[0]
  const last = values[values.length - 1]
  const change = first ? ((last - first) / first) * 100 : 0

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (data.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * width
    const i = Math.round(((px - PAD.left) / innerW) * (data.length - 1))
    setHover(Math.min(data.length - 1, Math.max(0, i)))
  }

  const hp = hover !== null ? data[hover] : null

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Price measure" className="flex flex-wrap gap-1.5">
          {METRICS.map((m) => (
            <Button key={m.id} size="sm" variant={metric === m.id ? 'default' : 'outline'} onClick={() => setMetric(m.id)} aria-pressed={metric === m.id}>
              {m.label}
            </Button>
          ))}
        </div>
        <div role="group" aria-label="Time range" className="flex gap-1 rounded-lg bg-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors motion-reduce:transition-none',
                range === r.id ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={wrap}>
      {data.length < 2 ? (
        <div className="grid h-[300px] place-items-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
          <p className="max-w-xs">Price history is being collected. The chart fills in automatically as daily rates are recorded.</p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold tabular">
              {formatMoney(hp ? valueFor(hp, metric) : last, cur)}
            </span>
            <span className="text-sm text-muted-foreground">
              {hp ? fmtDay(hp.day, true) : (
                <span className={change >= 0 ? 'text-up' : 'text-down'}>
                  {change >= 0 ? '+' : ''}
                  {change.toFixed(2)}% over {RANGES.find((r) => r.id === range)?.label}
                </span>
              )}
            </span>
          </div>
          <div className="relative">
            <svg
              width="100%"
              height={H}
              viewBox={`0 0 ${width} ${H}`}
              role="img"
              aria-label={`Gold price chart, ${METRICS.find((m) => m.id === metric)?.label}, ${fmtDay(data[0].day, true)} to ${fmtDay(data[data.length - 1].day, true)}`}
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
              className="touch-pan-y select-none"
            >
              <defs>
                <linearGradient id="goldFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--border)" />
                  <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular">
                    {Math.round(t).toLocaleString('en-US')}
                  </text>
                </g>
              ))}
              {xTicks.map((i, n) => (
                <text
                  key={i}
                  x={x(i)}
                  y={H - 8}
                  textAnchor={n === 0 ? 'start' : n === xTicks.length - 1 ? 'end' : 'middle'}
                  className="fill-muted-foreground text-[11px]"
                >
                  {fmtDay(data[i].day)}
                </text>
              ))}
              <path d={area} fill="url(#goldFill)" />
              <path d={path} fill="none" stroke="var(--chart-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {hover !== null ? (
                <g>
                  <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                  <circle cx={x(hover)} cy={y(values[hover])} r={5} fill="var(--chart-1)" stroke="var(--card)" strokeWidth={2} />
                </g>
              ) : (
                <circle cx={x(data.length - 1)} cy={y(last)} r={4} fill="var(--chart-1)" stroke="var(--card)" strokeWidth={2} />
              )}
            </svg>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
