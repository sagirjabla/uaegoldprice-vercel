/**
 * Pure gold maths shared by server and client. No I/O here.
 * All base prices are international spot in USD per troy ounce.
 */

/** UAE dirham is pegged to the US dollar. */
export const AED_PER_USD = 3.6725
export const GRAMS_PER_TROY_OUNCE = 31.1034768
export const UAE_VAT_RATE = 0.05

export const KARATS = [
  { id: '24k', karat: 24, purity: 0.999, label: '24K', note: '99.9% pure · bars & coins' },
  { id: '22k', karat: 22, purity: 0.916, label: '22K', note: '91.6% · most popular for jewellery' },
  { id: '21k', karat: 21, purity: 0.875, label: '21K', note: '87.5% · Arabic-style jewellery' },
  { id: '18k', karat: 18, purity: 0.75, label: '18K', note: '75% · diamond & designer pieces' },
  { id: '14k', karat: 14, purity: 0.585, label: '14K', note: '58.5% · durable everyday wear' },
  { id: '10k', karat: 10, purity: 0.417, label: '10K', note: '41.7% · budget jewellery' },
  { id: '9k', karat: 9, purity: 0.375, label: '9K', note: '37.5% · lowest common karat' },
] as const

export type KaratId = (typeof KARATS)[number]['id']
/** Karats shown in headline rate cards. */
export const MAIN_KARATS: KaratId[] = ['24k', '22k', '21k', '18k']

export const UNITS = [
  { id: 'gram', label: 'Gram', short: 'g', grams: 1 },
  { id: 'tola', label: 'Tola', short: 'tola', grams: 11.6638 },
  { id: 'sovereign', label: 'Sovereign (pavan)', short: 'sov', grams: 8 },
  { id: 'ounce', label: 'Troy ounce', short: 'oz', grams: GRAMS_PER_TROY_OUNCE },
  { id: 'kg', label: 'Kilogram', short: 'kg', grams: 1000 },
] as const

export type UnitId = (typeof UNITS)[number]['id']

export const CURRENCIES = [
  { code: 'AED', label: 'UAE Dirham', symbol: 'AED', locale: 'en-AE' },
  { code: 'USD', label: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: 'Rs', locale: 'en-PK' },
  { code: 'PHP', label: 'Philippine Peso', symbol: '₱', locale: 'en-PH' },
  { code: 'BDT', label: 'Bangladeshi Taka', symbol: '৳', locale: 'en-BD' },
  { code: 'LKR', label: 'Sri Lankan Rupee', symbol: 'Rs', locale: 'en-LK' },
  { code: 'NPR', label: 'Nepalese Rupee', symbol: 'Rs', locale: 'en-NP' },
  { code: 'EGP', label: 'Egyptian Pound', symbol: 'E£', locale: 'en-EG' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: 'SAR', locale: 'en-SA' },
  { code: 'GBP', label: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'EUR', label: 'Euro', symbol: '€', locale: 'en-IE' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']
/** Exchange rates expressed as units of currency per 1 USD. */
export type FxRates = Record<CurrencyCode, number>

export function karatById(id: KaratId) {
  return KARATS.find((k) => k.id === id) ?? KARATS[0]
}

export function unitById(id: UnitId) {
  return UNITS.find((u) => u.id === id) ?? UNITS[0]
}

/** AED price of one gram of the given karat. */
export function aedPerGram(goldUsdPerOz: number, karat: KaratId = '24k') {
  return ((goldUsdPerOz * AED_PER_USD) / GRAMS_PER_TROY_OUNCE) * karatById(karat).purity
}

/** Convert an AED amount into another currency using USD-based FX. */
export function convertFromAed(amountAed: number, currency: CurrencyCode, fx: FxRates) {
  if (currency === 'AED') return amountAed
  return (amountAed / AED_PER_USD) * (fx[currency] ?? 0)
}

export function formatMoney(amount: number, currency: CurrencyCode = 'AED', digits = 2) {
  const c = CURRENCIES.find((x) => x.code === currency) ?? CURRENCIES[0]
  const n = new Intl.NumberFormat(c.locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
  return `${c.symbol} ${n}`
}

export function formatNumber(amount: number, digits = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}

export interface CalcInput {
  weight: number
  unit: UnitId
  karat: KaratId
  makingType: 'percent' | 'perGram' | 'none'
  makingValue: number
  vat: 'none' | 'making' | 'total'
}

export interface CalcResult {
  grams: number
  goldValue: number
  making: number
  vat: number
  total: number
}

/** Buying cost of jewellery in AED: gold value + making charges + optional VAT. */
export function calculateJewellery(input: CalcInput, goldUsdPerOz: number): CalcResult {
  const grams = Math.max(0, input.weight) * unitById(input.unit).grams
  const goldValue = grams * aedPerGram(goldUsdPerOz, input.karat)
  const mv = Math.max(0, input.makingValue || 0)
  const making =
    input.makingType === 'percent'
      ? (goldValue * mv) / 100
      : input.makingType === 'perGram'
        ? grams * mv
        : 0
  const vatBase = input.vat === 'total' ? goldValue + making : input.vat === 'making' ? making : 0
  const vat = vatBase * UAE_VAT_RATE
  return { grams, goldValue, making, vat, total: goldValue + making + vat }
}

/** What a buyer typically pays for old gold after a deduction percentage. */
export function calculateSelling(
  weight: number,
  unit: UnitId,
  karat: KaratId,
  deductionPct: number,
  goldUsdPerOz: number,
) {
  const grams = Math.max(0, weight) * unitById(unit).grams
  const market = grams * aedPerGram(goldUsdPerOz, karat)
  const deduction = (market * Math.min(100, Math.max(0, deductionPct))) / 100
  return { grams, market, deduction, payout: market - deduction }
}

/** Weight rows used in price tables across the site. */
export const WEIGHT_ROWS: { label: string; grams: number }[] = [
  { label: '1 gram', grams: 1 },
  { label: '8 grams (1 sovereign)', grams: 8 },
  { label: '10 grams', grams: 10 },
  { label: '1 tola (11.66 g)', grams: 11.6638 },
  { label: '1 troy ounce (31.10 g)', grams: GRAMS_PER_TROY_OUNCE },
  { label: '50 grams', grams: 50 },
  { label: '100 grams', grams: 100 },
  { label: '1 kilogram', grams: 1000 },
]
