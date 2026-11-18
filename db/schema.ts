import { date, doublePrecision, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * One row per UAE calendar day (Asia/Dubai). Prices are international spot
 * in USD per troy ounce; AED and karat rates are derived at read time.
 */
export const dailyPrices = pgTable('daily_prices', {
  day: date('day', { mode: 'string' }).primaryKey(),
  goldOpen: doublePrecision('gold_open').notNull(),
  goldHigh: doublePrecision('gold_high').notNull(),
  goldLow: doublePrecision('gold_low').notNull(),
  goldClose: doublePrecision('gold_close').notNull(),
  silverClose: doublePrecision('silver_close'),
  source: text('source').notNull().default('live'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type DailyPrice = typeof dailyPrices.$inferSelect
