import { useId, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CURRENCIES,
  KARATS,
  UNITS,
  aedPerGram,
  calculateJewellery,
  calculateSelling,
  convertFromAed,
  formatMoney,
  formatNumber,
  type CalcInput,
  type CurrencyCode,
  type FxRates,
  type KaratId,
  type UnitId,
} from '@/lib/gold-math'
import { cn } from '@/lib/utils'

const selectClass =
  'h-10 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

function Field({ label, children, hint }: { label: string; children: (id: string) => React.ReactNode; hint?: string }) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function num(v: string) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export function GoldCalculator({
  goldUsdOz,
  fx,
  defaultKarat = '22k',
  defaultUnit = 'gram',
  compact = false,
}: {
  goldUsdOz: number
  fx: FxRates
  defaultKarat?: KaratId
  defaultUnit?: UnitId
  compact?: boolean
}) {
  const [weight, setWeight] = useState('10')
  const [unit, setUnit] = useState<UnitId>(defaultUnit)
  const [karat, setKarat] = useState<KaratId>(defaultKarat)
  const [makingType, setMakingType] = useState<CalcInput['makingType']>('perGram')
  const [makingValue, setMakingValue] = useState('15')
  const [vat, setVat] = useState<CalcInput['vat']>('total')
  const [deduction, setDeduction] = useState('5')
  const [currency, setCurrency] = useState<CurrencyCode>('AED')
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')

  const buy = useMemo(
    () =>
      calculateJewellery(
        { weight: num(weight), unit, karat, makingType, makingValue: num(makingValue), vat },
        goldUsdOz,
      ),
    [weight, unit, karat, makingType, makingValue, vat, goldUsdOz],
  )
  const sell = useMemo(
    () => calculateSelling(num(weight), unit, karat, num(deduction), goldUsdOz),
    [weight, unit, karat, deduction, goldUsdOz],
  )
  const fmt = (aed: number) => formatMoney(convertFromAed(aed, currency, fx), currency)
  const rate = aedPerGram(goldUsdOz, karat)
  const karatLabel = KARATS.find((k) => k.id === karat)?.label

  const common = (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="Weight">
        {(id) => (
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="tabular"
          />
        )}
      </Field>
      <Field label="Unit">
        {(id) => (
          <select id={id} className={selectClass} value={unit} onChange={(e) => setUnit(e.target.value as UnitId)}>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Karat (purity)">
        {(id) => (
          <select id={id} className={selectClass} value={karat} onChange={(e) => setKarat(e.target.value as KaratId)}>
            {KARATS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label} · {(k.purity * 100).toFixed(1)}%
              </option>
            ))}
          </select>
        )}
      </Field>
    </div>
  )

  return (
    <div className={cn('grid gap-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-6', !compact && 'lg:grid-cols-[1.25fr_1fr]')}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'buy' | 'sell')} className="gap-5">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="buy">Buying jewellery</TabsTrigger>
          <TabsTrigger value="sell">Selling old gold</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          {common}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Making charges">
              {(id) => (
                <select
                  id={id}
                  className={selectClass}
                  value={makingType}
                  onChange={(e) => setMakingType(e.target.value as CalcInput['makingType'])}
                >
                  <option value="perGram">AED per gram</option>
                  <option value="percent">% of gold value</option>
                  <option value="none">None (bars & coins)</option>
                </select>
              )}
            </Field>
            <Field label={makingType === 'percent' ? 'Making (%)' : 'Making (AED/g)'}>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  disabled={makingType === 'none'}
                  value={makingValue}
                  onChange={(e) => setMakingValue(e.target.value)}
                  className="tabular"
                />
              )}
            </Field>
            <Field label="VAT (5%)">
              {(id) => (
                <select id={id} className={selectClass} value={vat} onChange={(e) => setVat(e.target.value as CalcInput['vat'])}>
                  <option value="total">On total price</option>
                  <option value="making">On making charges only</option>
                  <option value="none">No VAT (investment gold)</option>
                </select>
              )}
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          {common}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Buyer deduction (%)" hint="Typical UAE buy-back deductions are 2–10%.">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step="any"
                  value={deduction}
                  onChange={(e) => setDeduction(e.target.value)}
                  className="tabular"
                />
              )}
            </Field>
          </div>
        </TabsContent>

        <div className="max-w-56">
          <Field label="Show result in">
            {(id) => (
              <select
                id={id}
                className={selectClass}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} · {c.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </Tabs>

      <div className="flex flex-col justify-between rounded-xl bg-ink p-5 text-ink-foreground" aria-live="polite">
        {mode === 'buy' ? (
          <>
            <div>
              <p className="text-sm text-ink-foreground/60">Estimated jewellery price</p>
              <p className="mt-1 font-display text-4xl font-semibold text-gold tabular">{fmt(buy.total)}</p>
              <p className="mt-1 text-xs text-ink-foreground/55">
                {formatNumber(buy.grams, 3)} g of {karatLabel} at {formatMoney(rate)}/g
              </p>
            </div>
            <dl className="mt-6 space-y-2 text-sm tabular">
              <Row label="Gold value" value={fmt(buy.goldValue)} />
              <Row label="Making charges" value={fmt(buy.making)} />
              <Row label="VAT" value={fmt(buy.vat)} />
              <div className="border-t border-white/15 pt-2">
                <Row label="Total" value={fmt(buy.total)} strong />
              </div>
            </dl>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm text-ink-foreground/60">Estimated payout for your old gold</p>
              <p className="mt-1 font-display text-4xl font-semibold text-gold tabular">{fmt(sell.payout)}</p>
              <p className="mt-1 text-xs text-ink-foreground/55">
                {formatNumber(sell.grams, 3)} g of {karatLabel} at {formatMoney(rate)}/g
              </p>
            </div>
            <dl className="mt-6 space-y-2 text-sm tabular">
              <Row label="Market value" value={fmt(sell.market)} />
              <Row label="Buyer deduction" value={`− ${fmt(sell.deduction)}`} />
              <div className="border-t border-white/15 pt-2">
                <Row label="You receive" value={fmt(sell.payout)} strong />
              </div>
            </dl>
          </>
        )}
        <p className="mt-5 text-xs text-ink-foreground/50">
          Estimate based on the live UAE rate. Shops may round weights and quote different making charges.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? 'font-semibold' : 'text-ink-foreground/70'}>{label}</dt>
      <dd className={strong ? 'font-semibold text-gold' : ''}>{value}</dd>
    </div>
  )
}
