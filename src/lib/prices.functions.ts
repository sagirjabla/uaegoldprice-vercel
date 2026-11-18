import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// The price service is loaded inside handlers so it only ever ships in the
// server bundle.

/** Live UAE gold snapshot (spot, FX, day change). Cached ~60s per instance. */
export const fetchLiveRates = createServerFn({ method: 'GET' }).handler(async () => {
  const { getLiveSnapshot } = await import('./prices.server')
  return getLiveSnapshot()
})

const historyInput = z.object({ days: z.number().int().min(7).max(400) })

/** Daily gold/silver closes for the chart and history tables. */
export const fetchHistory = createServerFn({ method: 'GET' })
  .validator(historyInput)
  .handler(async ({ data }) => {
    const { getHistory } = await import('./prices.server')
    return getHistory(data.days)
  })
