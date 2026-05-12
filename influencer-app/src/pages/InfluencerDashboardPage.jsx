import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getCampaignTitlesByIds } from '../services/campaigns'
import { listInfluencerGigs } from '../services/gigs'

export default function InfluencerDashboardPage() {
  const { user, role } = useAuth()
  const influencerId = user?.id

  const [gigs, setGigs] = useState([])
  const [campaignTitles, setCampaignTitles] = useState(() => new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!influencerId) return
      setIsLoading(true)
      setError('')
      try {
        const data = await listInfluencerGigs({ influencerId })
        if (cancelled) return
        setGigs(data)

        const ids = Array.from(
          new Set(data.map((g) => g.campaign_id).filter((x) => x !== null && x !== undefined)),
        )
        const titles = await getCampaignTitlesByIds({ ids })
        if (!cancelled) setCampaignTitles(titles)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load gigs')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [influencerId])

  const welcomeName = useMemo(() => user?.email || 'there', [user?.email])

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-white/60">Influencer</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
              Welcome, <span className="text-white/90">{welcomeName}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Here are your current gigs and their status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
              Role: <span className="text-white">{role || 'influencer'}</span>
            </span>
          </div>
        </header>

        <section className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold">Gigs</h2>
            <div className="text-xs text-white/60">{gigs.length} total</div>
          </div>

          {isLoading ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Loading gigs…
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-white/90"
            >
              {error}
            </div>
          ) : null}

          {!isLoading && !error && gigs.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              No gigs yet. When a brand sends you an offer, it will show up here.
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gigs.map((g) => {
              const campaignName =
                campaignTitles.get(String(g.campaign_id)) || `Campaign ${g.campaign_id}`
              const status = g.status || 'pending'

              return (
                <article
                  key={g.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white/60">Campaign</div>
                      <div className="mt-1 truncate text-base font-extrabold">{campaignName}</div>
                    </div>

                    <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/80">
                      {status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-white/70">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/60">Brand ID</span>
                      <span className="truncate font-mono text-xs text-white/80">{g.brand_id}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

