import { createFileRoute } from '@tanstack/react-router'

/**
 * Vercel Cron endpoint (see vercel.json). Records the live price and seeds
 * history if needed. Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export const Route = createFileRoute('/api/cron/record-price')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET
        if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
          return new Response('Unauthorized', { status: 401 })
        }
        const { backfillHistory, getLiveSnapshot } = await import('@/lib/prices.server')
        try {
          await backfillHistory()
        } catch (err) {
          console.error('[cron] backfill skipped', (err as Error).message)
        }
        const snap = await getLiveSnapshot()
        return Response.json({ ok: true, goldUsdOz: snap.goldUsdOz, stale: snap.stale })
      },
    },
  },
})
