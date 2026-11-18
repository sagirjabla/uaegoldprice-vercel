import { Link, createFileRoute } from '@tanstack/react-router'
import { Section } from '@/components/site/rates'
import { SITE } from '@/content/pages'
import { pageHead } from '@/lib/seo'

export const Route = createFileRoute('/about')({
  head: () =>
    pageHead({
      title: `About ${SITE.name} – How We Calculate UAE Gold Rates`,
      description: 'How UAE Gold Price calculates live gold rates in Dubai and the UAE, where the data comes from and how often it updates.',
      path: '/about',
    }),
  component: About,
})

function About() {
  return (
    <>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-content px-4 py-10 sm:px-6 md:py-14">
          <h1 className="text-4xl font-semibold sm:text-5xl">About & methodology</h1>
        </div>
      </section>
      <Section title="What we do">
        <div className="prose-gold max-w-reading">
          <p>
            {SITE.name} gives residents, visitors and jewellery shoppers a fast, ad-light way to check the live gold rate in
            Dubai and the rest of the UAE, and to calculate the real price of jewellery before visiting a shop.
          </p>
        </div>
      </Section>
      <Section title="How rates are calculated">
        <div className="prose-gold max-w-reading">
          <p>
            We take the international spot price of gold in US dollars per troy ounce, refreshed every minute, and convert it
            at the UAE dirham peg of AED 3.6725 per dollar. Dividing by 31.1035 grams gives the 24K rate per gram. Other
            karats are priced by purity: 22K × 91.6%, 21K × 87.5%, 18K × 75%, 14K × 58.5%, 10K × 41.7% and 9K × 37.5%.
          </p>
          <p>
            Currency conversions (INR, PKR, PHP and others) use live mid-market exchange rates refreshed several times a
            day. Price history is recorded every 15 minutes and stored as a daily open, high, low and close.
          </p>
          <p>
            Retail board rates published by jewellers can differ slightly from these purity-based values, and shops add
            making charges and VAT. Our figures are for information only — always confirm the final price in store.
          </p>
        </div>
      </Section>
      <Section title="Start here">
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li><Link to="/" className="text-gold-deep underline-offset-4 hover:underline">Gold rate in UAE today</Link></li>
          <li><Link to="/gold-calculator" className="text-gold-deep underline-offset-4 hover:underline">Gold calculator</Link></li>
          <li><Link to="/gold-price-chart" className="text-gold-deep underline-offset-4 hover:underline">Gold price chart</Link></li>
        </ul>
      </Section>
    </>
  )
}
