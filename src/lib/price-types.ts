import type { FxRates } from './gold-math'

export interface LiveSnapshot {
  goldUsdOz: number
  silverUsdOz: number | null
  updatedAt: string
  /** Previous UAE day's closing gold price, for day-on-day change. */
  prevGoldUsdOz: number | null
  dayHigh: number | null
  dayLow: number | null
  fx: FxRates
  stale: boolean
}

export interface HistoryPoint {
  day: string
  gold: number
  silver: number | null
}
