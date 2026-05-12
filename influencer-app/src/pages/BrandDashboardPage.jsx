import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listMyCampaigns } from '../services/campaigns'
import { listBrandGigs } from '../services/gigs'

function formatMoney(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

export default function BrandDashboardPage() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const brandId = user?.id

  const [campaigns, setCampaigns] = useState([])
  const [gigs, setGigs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!brandId) return
      setIsLoading(true)
      setError('')
      try {
        const [camps, brandGigs] = await Promise.all([
          listMyCampaigns({ userId: brandId }),
          listBrandGigs({ brandId }),
        ])
        if (cancelled) return
        setCampaigns(camps)
        setGigs(brandGigs)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load brand dashboard')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [brandId])

  const campaignsById = useMemo(() => {
    const map = new Map()
    for (const c of campaigns) map.set(String(c.id), c)
    return map
  }, [campaigns])

  if (role !== 'brand') {
    return (
      <section style={{ maxWidth: 520 }}>
        <h1 style={{ margin: 0 }}>Brand dashboard</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          This page is only for brand accounts.
        </p>
        <div style={{ marginTop: 16 }}>
          <button type="button" onClick={() => navigate('/dashboard')}>
            Back
          </button>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Brand dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/campaigns/new">New campaign</Link>
          <button type="button" onClick={() => navigate('/dashboard')}>
            Back
          </button>
        </div>
      </div>

      {isLoading ? <p style={{ marginTop: 12, opacity: 0.85 }}>Loading…</p> : null}

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,90,90,0.35)',
            background: 'rgba(255,90,90,0.10)',
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 12,
        }}
      >
        <section
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Campaigns</h2>
          <p style={{ marginTop: 6, opacity: 0.85 }}>Your active campaigns.</p>

          {!isLoading && !error && campaigns.length === 0 ? (
            <p style={{ marginTop: 10, opacity: 0.85 }}>
              No campaigns yet. Create one at <strong style={{ color: 'white' }}>/campaigns/new</strong>.
            </p>
          ) : null}

          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {campaigns.map((c) => (
              <div
                key={c.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 800 }}>{c.title}</div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  Budget: <strong style={{ color: 'white' }}>{formatMoney(c.budget)}</strong>
                </div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                  id: {c.id}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Sent offers</h2>
          <p style={{ marginTop: 6, opacity: 0.85 }}>
            Gigs you’ve sent to influencers.
          </p>

          {!isLoading && !error && gigs.length === 0 ? (
            <p style={{ marginTop: 10, opacity: 0.85 }}>No offers sent yet.</p>
          ) : null}

          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {gigs.map((g) => {
              const campaign = campaignsById.get(String(g.campaign_id))
              return (
                <div
                  key={g.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>
                      {campaign?.title || 'Campaign'}
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      Status:{' '}
                      <strong style={{ color: 'white' }}>{g.status || 'pending'}</strong>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                    Influencer: {g.influencer_id} • Campaign: {g.campaign_id}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </section>
  )
}

