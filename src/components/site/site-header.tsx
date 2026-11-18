import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CITY_PAGES, KARAT_PAGES, SITE } from '@/content/pages'

const NAV = [
  { to: '/', label: 'Today’s rate' },
  { to: '/gold-calculator', label: 'Gold calculator' },
  { to: '/gold-price-chart', label: 'Price chart' },
  { to: '/silver-rate', label: 'Silver rate' },
] as const

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink-foreground">
      <span aria-hidden className="grid size-8 place-items-center rounded-md bg-gradient-to-br from-gold to-gold-deep text-xs font-bold text-ink shadow-inner">
        Au
      </span>
      {SITE.name}
    </Link>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-foreground/75 transition-colors hover:text-gold motion-reduce:transition-none data-[status=active]:text-gold"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="rounded-md p-2 text-ink-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{SITE.name}</SheetTitle>
              <SheetDescription>Live gold rates across the UAE</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-8">
              <ul className="space-y-1">
                {NAV.map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 font-medium hover:bg-muted">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <MobileGroup title="By emirate" pages={CITY_PAGES} onNavigate={() => setOpen(false)} />
              <MobileGroup title="By karat" pages={KARAT_PAGES} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function MobileGroup({
  title,
  pages,
  onNavigate,
}: {
  title: string
  pages: { slug: string; nav: string }[]
  onNavigate: () => void
}) {
  return (
    <div>
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="grid grid-cols-2 gap-1">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link
              to="/gold-rate/$slug"
              params={{ slug: p.slug }}
              onClick={onNavigate}
              className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              {p.nav}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
