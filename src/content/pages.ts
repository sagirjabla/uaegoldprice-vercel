/**
 * Landing-page content for /gold-rate/$slug. Each entry targets one keyword
 * cluster from the keyword research (city, karat, unit, currency or product).
 * Add a page by adding an entry here — routing, sitemap and nav pick it up.
 */
import type { CurrencyCode, KaratId } from '@/lib/gold-math'

export const SITE = {
  name: 'UAE Gold Price',
  // Set VITE_SITE_URL in Vercel (e.g. https://www.yourdomain.com) once you have a
  // custom domain. No trailing slash.
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://uae-gold-price.vercel.app',
  tagline: 'Live gold rate in Dubai & across the UAE',
  description:
    'Live gold rate today in UAE & Dubai: 24K, 22K, 21K and 18K gold price per gram, tola and ounce in AED, plus a free gold calculator with making charges and VAT.',
}

export interface Faq {
  q: string
  a: string
}

export type LandingKind = 'city' | 'karat' | 'unit' | 'currency' | 'product'

export interface LandingPage {
  slug: string
  kind: LandingKind
  /** Short label for navigation. */
  nav: string
  h1: string
  title: string
  description: string
  intro: string[]
  /** Karat to feature in the headline figure. */
  focusKarat: KaratId
  /** Weight table unit focus. */
  focusUnit?: 'gram' | 'tola' | 'ounce' | 'bar'
  /** Show the main table converted into this currency. */
  currency?: CurrencyCode
  faqs: Faq[]
}

const cityFaqs = (city: string): Faq[] => [
  {
    q: `Is the gold rate in ${city} the same as in Dubai?`,
    a: `Yes. Jewellers across the UAE follow the same daily board rate, which tracks the international spot price converted at the fixed rate of AED 3.6725 per US dollar. Differences between shops in ${city} come from making charges, design and promotions, not the gold rate itself.`,
  },
  {
    q: `What is today's 22K gold rate per gram in ${city}?`,
    a: `The live 22K rate is shown at the top of this page and refreshes every few minutes. 22K gold is 91.6% pure, so its rate is 91.6% of the 24K price.`,
  },
  {
    q: `Do I pay VAT when buying gold jewellery in ${city}?`,
    a: 'Gold jewellery carries 5% UAE VAT. Investment-grade gold of 99% purity or higher (bars and coins) is zero-rated. Tourists can reclaim VAT on eligible purchases at the airport through the Planet tax-refund system.',
  },
]

const city = (slug: string, name: string, extra: string): LandingPage => ({
  slug,
  kind: 'city',
  nav: name,
  h1: `Gold Rate in ${name} Today`,
  title: `Gold Rate in ${name} Today – 24K, 22K, 21K & 18K per Gram (AED)`,
  description: `Today's live gold rate in ${name}, UAE. Check 24K, 22K, 21K and 18K gold prices per gram, tola and ounce in AED, updated every few minutes.`,
  intro: [
    `Looking for the gold price in ${name} today? Below is the live gold rate for ${name}, calculated from the international spot price and converted into UAE dirhams. Rates are shown for every popular purity, from 24 karat bullion to 18 karat jewellery.`,
    extra,
  ],
  focusKarat: '22k',
  faqs: cityFaqs(name),
})

const karat = (
  id: KaratId,
  k: number,
  purity: string,
  uses: string,
  faqs: Faq[],
): LandingPage => ({
  slug: id,
  kind: 'karat',
  nav: `${k}K gold`,
  h1: `${k} Carat Gold Rate in UAE Today`,
  title: `${k}K Gold Rate Today in UAE & Dubai – ${k} Carat Price per Gram`,
  description: `Live ${k} carat (${k}K) gold price in Dubai and the UAE today, per gram, 10 grams, tola and ounce in AED. ${purity} pure gold, updated every few minutes.`,
  intro: [
    `${k} karat gold contains ${purity} pure gold. ${uses}`,
    `The ${k}K rate below is derived live from the international spot price and converted at the AED–USD peg, so it matches the reference rate used by jewellers in Dubai, Abu Dhabi, Sharjah and the rest of the UAE.`,
  ],
  focusKarat: id,
  faqs,
})

export const LANDING_PAGES: LandingPage[] = [
  city(
    'dubai',
    'Dubai',
    'Dubai is one of the world’s busiest gold markets. The famous Deira Gold Souk, Gold & Diamond Park and hundreds of jewellers in malls all quote prices from the same daily board rate, so checking the live rate before you shop is the easiest way to judge a fair price.',
  ),
  city(
    'abu-dhabi',
    'Abu Dhabi',
    'In Abu Dhabi, jewellers in the Madinat Zayed Gold Centre, the Central Market and major malls follow the same UAE board rate as Dubai. Use the calculator to add making charges and VAT for a realistic final price.',
  ),
  city(
    'sharjah',
    'Sharjah',
    'Sharjah’s Central Souk (Blue Souk) and gold shops in Rolla and Al Nahda price gold using the national daily rate. Many residents compare Sharjah and Dubai prices — the gold rate is identical, so compare making charges instead.',
  ),
  city(
    'ajman',
    'Ajman',
    'Ajman’s gold and jewellery shops follow the same UAE gold rate as the rest of the country. Because the rate is identical, savings in Ajman usually come from lower making charges on everyday jewellery.',
  ),
  city(
    'al-ain',
    'Al Ain',
    'Al Ain jewellers in the Al Ain Gold Souk and city malls use the UAE board rate published each morning and adjusted through the day as the global market moves.',
  ),
  city(
    'ras-al-khaimah',
    'Ras Al Khaimah',
    'Gold shops in Ras Al Khaimah price 24K, 22K, 21K and 18K gold from the same national rate. Use our calculator to estimate making charges before visiting a store.',
  ),
  city(
    'fujairah',
    'Fujairah',
    'In Fujairah, jewellers follow the daily UAE gold rate shown below. Prices for bangles, chains and coins then add making charges that vary by design and shop.',
  ),
  city(
    'umm-al-quwain',
    'Umm Al Quwain',
    'Umm Al Quwain jewellers quote gold using the same UAE gold rate as Dubai and Abu Dhabi, so the live rate below applies directly.',
  ),
  karat('24k', 24, '99.9%', 'It is the purest form sold in the UAE, used for gold bars, coins and investment. Pure gold is soft, so it is rarely used for everyday jewellery.', [
    { q: 'Is 24K gold good for jewellery?', a: '24K gold is very soft and scratches or bends easily, so it is mostly bought as bars or coins for investment. For jewellery, most buyers in the UAE choose 22K or 21K.' },
    { q: 'Is VAT charged on 24K gold bars in the UAE?', a: 'Investment gold of 99% purity or more is zero-rated for VAT in the UAE, so 24K bars and coins usually carry no 5% VAT.' },
    { q: 'How is the 24K gold rate calculated?', a: 'The international spot price in US dollars per troy ounce is converted into dirhams at AED 3.6725 per dollar, then divided by 31.1035 grams per ounce.' },
  ]),
  karat('22k', 22, '91.6%', 'It is the most popular choice for jewellery among UAE residents, especially for Indian and Pakistani style necklaces, bangles and wedding sets, offering a rich colour with enough strength for daily wear.', [
    { q: 'What is the difference between 22K and 24K gold?', a: '24K is 99.9% pure gold while 22K is 91.6% gold mixed with metals like copper and silver for strength. 22K costs about 8% less per gram than 24K.' },
    { q: 'What does 916 gold mean?', a: '916 is the hallmark for 22 karat gold: 916 parts of pure gold per 1,000, or 91.6% purity.' },
    { q: 'How do I calculate the price of a 22K gold chain?', a: 'Multiply the weight in grams by the live 22K rate, then add making charges and 5% VAT. Our gold calculator does this for you.' },
  ]),
  karat('21k', 21, '87.5%', 'It is widely used for Arabic and Emirati style jewellery across the Gulf and is a good balance of purity, colour and durability.', [
    { q: 'Is 21K gold popular in the UAE?', a: 'Yes. 21K gold is the traditional choice for Arabic and Emirati jewellery and is sold in almost every gold souk in the UAE.' },
    { q: 'What hallmark does 21K gold carry?', a: '21 karat gold is stamped 875, meaning 875 parts pure gold per 1,000.' },
    { q: 'How much cheaper is 21K than 22K?', a: '21K contains 87.5% gold versus 91.6% for 22K, so it costs roughly 4.5% less per gram before making charges.' },
  ]),
  karat('18k', 18, '75%', 'It is the standard for diamond jewellery, designer pieces and white or rose gold, because the higher share of alloy metals makes it harder and holds stones securely.', [
    { q: 'Why is 18K gold used for diamond jewellery?', a: '18K gold is harder than 22K or 24K, so it holds diamonds and gemstones securely and resists scratches.' },
    { q: 'Is white gold priced the same as yellow 18K gold?', a: 'The gold content and rate are the same; white gold may carry extra making charges for rhodium plating.' },
    { q: 'What hallmark does 18K gold carry?', a: '18 karat gold is stamped 750, meaning 75% pure gold.' },
  ]),
  {
    slug: 'tola',
    kind: 'unit',
    nav: 'Price per tola',
    h1: 'Gold Price per Tola in UAE Today',
    title: '1 Tola Gold Price in UAE & Dubai Today – 24K, 22K Tola Rate (AED)',
    description:
      'Live 1 tola gold price in UAE and Dubai today for 24K, 22K, 21K and 18K. See prices for 1 to 10 tola in AED, plus tola-to-gram conversion.',
    intro: [
      'A tola is a traditional South Asian unit of weight for gold, widely used by Indian, Pakistani, Bangladeshi and Nepali buyers in the UAE. One tola equals 11.6638 grams.',
      'The tola rates below are calculated live from the UAE gold rate per gram. Many Dubai jewellers and bullion dealers also sell 10 tola (116.64 g) gold bars.',
    ],
    focusKarat: '24k',
    focusUnit: 'tola',
    faqs: [
      { q: 'How many grams is 1 tola of gold?', a: 'One tola is 11.6638 grams. Some markets round it to 11.66 g or 12 g, so always confirm the weight in grams on your receipt.' },
      { q: 'How much is a 10 tola gold bar in Dubai?', a: 'A 10 tola bar weighs 116.64 grams of 24K gold. Its price is shown in the table above; dealers add a small premium for minting.' },
      { q: 'Is gold cheaper per tola in Dubai than in Pakistan or India?', a: 'Gold in the UAE is usually cheaper because there is no import duty and investment gold is VAT-free. Check our INR and PKR pages for converted prices, and check customs allowances before travelling.' },
    ],
  },
  {
    slug: 'ounce',
    kind: 'unit',
    nav: 'Price per ounce',
    h1: 'Gold Price per Ounce in UAE Today',
    title: 'Gold Price per Ounce Today in AED & USD – Live Spot Gold UAE',
    description:
      'Live gold price per troy ounce today in AED and USD. International spot gold converted for the UAE, with 24K, 22K and 18K prices per ounce.',
    intro: [
      'Gold is traded internationally in US dollars per troy ounce. One troy ounce equals 31.1035 grams — heavier than a regular ounce (28.35 g).',
      'Because the UAE dirham is pegged at AED 3.6725 per US dollar, the price per ounce in dirhams moves exactly with the global spot price.',
    ],
    focusKarat: '24k',
    focusUnit: 'ounce',
    faqs: [
      { q: 'What is a troy ounce?', a: 'A troy ounce is the standard unit for precious metals, equal to 31.1035 grams.' },
      { q: 'Why does the gold price change during the day?', a: 'Gold trades almost 24 hours a day across London, New York and Asian markets, so the spot price moves with supply, demand, the US dollar and interest-rate expectations.' },
      { q: 'Where can I buy a 1 ounce gold bar in the UAE?', a: 'Bullion dealers, banks and large jewellers in Dubai and Abu Dhabi sell 1 oz bars and coins. Expect a small premium over the spot price.' },
    ],
  },
  {
    slug: 'gold-bar',
    kind: 'product',
    nav: 'Gold bar prices',
    h1: 'Gold Bar Price in Dubai & UAE Today',
    title: 'Gold Bar Price in Dubai Today – 1g, 10g, 100g, 10 Tola & 1kg (AED)',
    description:
      'Live gold bar prices in Dubai and the UAE today: 1 gram, 5g, 10g, 20g, 50g, 100g, 1 ounce, 10 tola and 1 kg 24K bars in AED.',
    intro: [
      'Gold bars sold in the UAE are 24 karat (999.9 fine) and are zero-rated for VAT as investment gold. The prices below are the value of the gold content at today’s live rate.',
      'Dealers add a minting premium that is higher on small bars (1g–10g) and lower on large bars (100g and 1kg), so larger bars usually offer better value per gram.',
    ],
    focusKarat: '24k',
    focusUnit: 'bar',
    faqs: [
      { q: 'Are gold bars in the UAE VAT-free?', a: 'Yes. Gold of 99% purity or higher that is traded as investment gold is zero-rated for VAT in the UAE.' },
      { q: 'What is the most popular gold bar size in Dubai?', a: 'The 10 tola (116.64 g) bar and the 1 kg bar are popular with traders, while 1g to 20g bars are popular gifts and small investments.' },
      { q: 'Why is the price per gram higher for small bars?', a: 'Each bar has a fixed cost to mint and certify, so small bars carry a higher premium per gram.' },
    ],
  },
  {
    slug: 'inr',
    kind: 'currency',
    nav: 'Dubai rate in INR',
    h1: 'Dubai Gold Rate Today in Indian Rupees (INR)',
    title: 'Dubai Gold Rate Today in Indian Rupees – UAE Gold Price in INR',
    description:
      'Today’s Dubai and UAE gold rate converted into Indian rupees (INR) for 24K, 22K and 18K, per gram, 10 grams and tola. Compare before you buy.',
    intro: [
      'Many Indian residents and visitors compare the Dubai gold rate with prices back home. This page converts the live UAE gold rate into Indian rupees at the current AED–INR exchange rate.',
      'Gold in India includes import duty and GST, which is why Dubai gold often works out cheaper. Before carrying gold to India, check the current duty-free allowance with Indian customs.',
    ],
    focusKarat: '22k',
    currency: 'INR',
    faqs: [
      { q: 'Why is gold cheaper in Dubai than in India?', a: 'India adds import duty and GST to gold, while the UAE has no import duty and zero VAT on investment gold. Jewellery making charges also tend to be competitive in Dubai.' },
      { q: 'How much gold can I take from Dubai to India?', a: 'Indian customs sets duty-free jewellery allowances for returning residents that depend on gender and length of stay. Rules change, so check the latest CBIC guidance before you fly.' },
      { q: 'Which exchange rate do you use?', a: 'We use a live mid-market AED to INR rate. Your bank or exchange house rate may differ slightly.' },
    ],
  },
  {
    slug: 'pkr',
    kind: 'currency',
    nav: 'Dubai rate in PKR',
    h1: 'UAE Gold Rate Today in Pakistani Rupees (PKR)',
    title: 'Dubai Gold Rate Today in Pakistani Rupees – Gold per Tola in PKR',
    description:
      'Live UAE and Dubai gold rate converted to Pakistani rupees (PKR): 24K and 22K gold per tola, gram and 10 grams. Updated every few minutes.',
    intro: [
      'Pakistani residents in the UAE often think in tola and rupees. This page converts the live Dubai gold rate into Pakistani rupees, with prices per tola, gram and 10 grams.',
      'Prices in Pakistan can differ from these converted figures because of local premiums, taxes and the open-market dollar rate.',
    ],
    focusKarat: '24k',
    focusUnit: 'tola',
    currency: 'PKR',
    faqs: [
      { q: 'How many grams is a tola in Pakistan?', a: 'One tola is 11.6638 grams, the same unit used by Dubai jewellers when quoting tola prices.' },
      { q: 'Why is the Pakistan gold rate different from the converted Dubai rate?', a: 'Local premiums, taxes, supply and the open-market exchange rate in Pakistan all change the final price.' },
      { q: 'Which exchange rate do you use?', a: 'We use a live mid-market AED to PKR rate. Exchange houses may quote slightly different rates.' },
    ],
  },
]

export function landingBySlug(slug: string) {
  return LANDING_PAGES.find((p) => p.slug === slug)
}

export const CITY_PAGES = LANDING_PAGES.filter((p) => p.kind === 'city')
export const KARAT_PAGES = LANDING_PAGES.filter((p) => p.kind === 'karat')
export const GUIDE_PAGES = LANDING_PAGES.filter((p) => p.kind !== 'city' && p.kind !== 'karat')

export const HOME_FAQS: Faq[] = [
  {
    q: 'What is the gold rate in UAE today?',
    a: 'The live gold rate in the UAE is shown at the top of this page for 24K, 22K, 21K and 18K gold per gram in AED. It updates every few minutes in line with the international spot price.',
  },
  {
    q: 'How is the UAE gold rate calculated?',
    a: 'Gold is priced globally in US dollars per troy ounce. Because the dirham is pegged at AED 3.6725 per US dollar, the 24K rate per gram is the spot price × 3.6725 ÷ 31.1035. Lower karats are priced by purity — for example 22K is 91.6% of the 24K rate.',
  },
  {
    q: 'Is the gold rate the same in Dubai, Abu Dhabi and Sharjah?',
    a: 'Yes. All emirates follow the same national gold rate. What differs between shops is the making charge, which depends on the design, the brand and how much you negotiate.',
  },
  {
    q: 'What are making charges on gold jewellery?',
    a: 'Making charges cover the craftsmanship of a piece. In the UAE they are quoted either per gram (often AED 8–50/g for plain jewellery) or as a percentage of the gold value, and are frequently negotiable.',
  },
  {
    q: 'Is VAT charged on gold in the UAE?',
    a: 'Gold jewellery carries 5% VAT. Investment gold (bars and coins of 99% purity or more) is zero-rated. Tourists can claim VAT refunds on eligible jewellery purchases when leaving the country.',
  },
  {
    q: 'When is the best time to buy gold in Dubai?',
    a: 'Prices follow the global market, so no day is guaranteed to be cheaper. Watching the gold price chart, and buying during promotions such as the Dubai Shopping Festival when making charges are discounted, can help.',
  },
]
