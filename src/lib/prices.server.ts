/**
 * Server-only price service: live spot prices, FX rates and daily history in
 * Postgres (Neon). Imported by server functions and the cron endpoint.
 */
import { asc, desc, gte, sql } from 'drizzle-orm'
import { ensureSchema } from '../../db/index.js'
import { dailyPrices } from '../../db/schema.js'
import { CURRENCIES, type FxRates } from './gold-math'
import type { HistoryPoint, LiveSnapshot } from './price-types'

export type { HistoryPoint, LiveSnapshot }

const GOLD_API = 'https://api.gold-api.com/price'
const FX_API = 'https://open.er-api.com/v6/latest/USD'
const YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart'

const SPOT_TTL_MS = 60_000
const FX_TTL_MS = 6 * 60 * 60_000

/** Fallback FX (per USD) used only if the FX provider is unreachable. */
const FALLBACK_FX: FxRates = {
  AED: 3.6725,
  USD: 1,
  INR: 88.5,
  PKR: 281,
  PHP: 58.5,
  BDT: 122,
  LKR: 300,
  NPR: 141,
  EGP: 48,
  SAR: 3.75,
  GBP: 0.76,
  EUR: 0.86,
}

// Public market data only — safe to memoise per server instance.
let spotCache: { at: number; gold: number; silver: number | null; updatedAt: string } | null = null
let fxCache: { at: number; fx: FxRates } | null = null
let backfillAttempted = false

export function uaeDay(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(6000) })
  if (!res.ok) throw new Error(`Upstream ${res.status}`)
  return res.json()
}

function readPrice(body: unknown): number {
  const price = (body as { price?: unknown })?.price
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    throw new Error('Invalid price payload')
  }
  return price
}

async function fetchSpot() {
  const [gold, silver] = await Promise.allSettled([
    fetchJson(`${GOLD_API}/XAU`).then(readPrice),
    fetchJson(`${GOLD_API}/XAG`).then(readPrice),
  ])
  if (gold.status !== 'fulfilled') throw new Error('Gold price unavailable')
  return {
    gold: gold.value,
    silver: silver.status === 'fulfilled' ? silver.value : null,
    updatedAt: new Date().toISOString(),
  }
}

export async function getFx(): Promise<FxRates> {
  if (fxCache && Date.now() - fxCache.at < FX_TTL_MS) return fxCache.fx
  try {
    const body = (await fetchJson(FX_API)) as { rates?: Record<string, unknown> }
    const fx = { ...FALLBACK_FX }
    for (const c of CURRENCIES) {
      const r = body.rates?.[c.code]
      if (typeof r === 'number' && r > 0) fx[c.code] = r
    }
    fx.AED = 3.6725
    fx.USD = 1
    fxCache = { at: Date.now(), fx }
    return fx
  } catch {
    return fxCache?.fx ?? FALLBACK_FX
  }
}

/** Record a live price into today's daily row, tracking open/high/low/close. */
export async function recordPrice(gold: number, silver: number | null, day = uaeDay()) {
  const db = await ensureSchema()
  await db
    .insert(dailyPrices)
    .values({
      day,
      goldOpen: gold,
      goldHigh: gold,
      goldLow: gold,
      goldClose: gold,
      silverClose: silver,
      source: 'live',
    })
    .onConflictDoUpdate({
      target: dailyPrices.day,
      set: {
        goldHigh: sql`GREATEST(${dailyPrices.goldHigh}, ${gold})`,
        goldLow: sql`LEAST(${dailyPrices.goldLow}, ${gold})`,
        goldClose: gold,
        silverClose: silver ?? sql`${dailyPrices.silverClose}`,
        source: 'live',
        updatedAt: new Date(),
      },
    })
}

async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.error('[prices] database unavailable', (err as Error).message)
    return fallback
  }
}

export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  const today = uaeDay()
  let stale = false

  if (!spotCache || Date.now() - spotCache.at > SPOT_TTL_MS) {
    try {
      const spot = await fetchSpot()
      spotCache = { at: Date.now(), ...spot }
      await safeDb(() => recordPrice(spot.gold, spot.silver, today), undefined)
    } catch (err) {
      console.error('[prices] live fetch failed', (err as Error).message)
      stale = true
    }
  }

  const [fx, rows] = await Promise.all([
    getFx(),
    safeDb(async () => (await ensureSchema()).select().from(dailyPrices).orderBy(desc(dailyPrices.day)).limit(2), []),
  ])

  const todayRow = rows.find((r) => r.day === today)
  const prevRow = rows.find((r) => r.day < today)

  let gold = spotCache?.gold
  let silver = spotCache?.silver ?? null
  let updatedAt = spotCache?.updatedAt
  if (!gold) {
    const latest = rows[0]
    if (!latest) throw new Error('Gold price is temporarily unavailable')
    gold = latest.goldClose
    silver = latest.silverClose
    updatedAt = latest.updatedAt.toISOString()
    stale = true
  }

  return {
    goldUsdOz: gold,
    silverUsdOz: silver,
    updatedAt: updatedAt ?? new Date().toISOString(),
    prevGoldUsdOz: prevRow?.goldClose ?? null,
    dayHigh: todayRow ? Math.max(todayRow.goldHigh, gold) : null,
    dayLow: todayRow ? Math.min(todayRow.goldLow, gold) : null,
    fx,
    stale,
  }
}

/** Seed up to a year of daily closes from public futures data, once. */
export async function backfillHistory(force = false) {
  if (backfillAttempted && !force) return 0
  const db = await ensureSchema()
  backfillAttempted = true
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(dailyPrices)
  if (count >= 120 && !force) return 0

  const load = async (symbol: string) => {
    const body = (await fetchJson(`${YAHOO_CHART}/${symbol}?range=1y&interval=1d`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GoldRateBot/1.0)' },
    })) as {
      chart?: {
        result?: {
          timestamp?: number[]
          indicators?: { quote?: { open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[] }[] }
        }[]
      }
    }
    const r = body.chart?.result?.[0]
    const q = r?.indicators?.quote?.[0]
    const out = new Map<string, { o: number; h: number; l: number; c: number }>()
    r?.timestamp?.forEach((ts, i) => {
      const c = q?.close?.[i]
      if (typeof c !== 'number') return
      out.set(uaeDay(new Date(ts * 1000)), {
        o: q?.open?.[i] ?? c,
        h: q?.high?.[i] ?? c,
        l: q?.low?.[i] ?? c,
        c,
      })
    })
    return out
  }

  const [gold, silver] = await Promise.all([load('GC=F'), load('SI=F').catch(() => new Map())])
  const today = uaeDay()
  const values = [...gold.entries()]
    .filter(([day]) => day < today)
    .map(([day, g]) => ({
      day,
      goldOpen: g.o,
      goldHigh: g.h,
      goldLow: g.l,
      goldClose: g.c,
      silverClose: silver.get(day)?.c ?? null,
      source: 'backfill',
    }))
  if (values.length === 0) return 0
  await db.insert(dailyPrices).values(values).onConflictDoNothing()
  return values.length
}

export async function getHistory(days: number): Promise<HistoryPoint[]> {
  await safeDb(() => backfillHistory(), 0)
  const since = new Date(Date.now() - days * 86_400_000)
  const rows = await safeDb(
    async () =>
      (await ensureSchema())
        .select({ day: dailyPrices.day, gold: dailyPrices.goldClose, silver: dailyPrices.silverClose })
        .from(dailyPrices)
        .where(gte(dailyPrices.day, uaeDay(since)))
        .orderBy(asc(dailyPrices.day)),
    [] as HistoryPoint[],
  )
  return rows
}
