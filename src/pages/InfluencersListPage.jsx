import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listMyCampaigns } from '../services/campaigns'
import { createGig } from '../services/gigs'
import { listInfluencerProfiles } from '../services/influencerProfiles'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  outline: 'none',
}

function formatMoney(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatInt(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return String(value ?? '')
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(num)
}

export default function InfluencersListPage() {
  const { user, role } = useAuth()
  const userId = user?.id

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [campaigns, setCampaigns] = useState([])
  const [campaignId, setCampaignId] = useState('')
  const [campaignsError, setCampaignsError] = useState('')
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false)

  const [sendingId, setSendingId] = useState(null)
  const [offerError, setOfferError] = useState('')
  const [offerMessage, setOfferMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await listInfluencerProfiles()
        if (!cancelled) setItems(data)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load influencer profiles')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCampaigns() {
      if (role !== 'brand' || !userId) return
      setIsCampaignsLoading(true)
      setCampaignsError('')
      try {
        const data = await listMyCampaigns({ userId })
        if (cancelled) return
        setCampaigns(data)
        if (data.length === 1) setCampaignId(String(data[0].id))
      } catch (err) {
        if (!cancelled) setCampaignsError(err?.message || 'Failed to load campaigns')
      } finally {
        if (!cancelled) setIsCampaignsLoading(false)
      }
    }

    loadCampaigns()
    return () => {
      cancelled = true
    }
  }, [role, userId])

  const canSendOffers = useMemo(() => {
    if (role !== 'brand') return false
    return Boolean(userId) && Boolean(campaignId) && !isCampaignsLoading
  }, [campaignId, isCampaignsLoading, role, userId])

  async function sendOffer(influencerId) {
    if (!userId) return
    if (role !== 'brand') return
    if (!campaignId) return

    setOfferError('')
    setOfferMessage('')
    setSendingId(influencerId)
    try {
      await createGig({
        brandId: userId,
        influencerId,
        campaignId,
      })
      setOfferMessage('Offer sent.')
    } catch (err) {
      setOfferError(err?.message || 'Failed to send offer')
    } finally {
      setSendingId(null)
    }
  }

  return (
    <section>
      <h1 style={{ margin: 0 }}>Influencers</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Browse influencer profiles.
      </p>

      {role === 'brand' ? (
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gap: 10,
            maxWidth: 520,
            padding: 12,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ fontWeight: 800 }}>Send offers</div>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 14, opacity: 0.9 }}>Campaign</span>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              style={inputStyle}
              disabled={isCampaignsLoading}
            >
              <option value="" disabled>
                {isCampaignsLoading ? 'Loading campaigns…' : 'Select a campaign'}
              </option>
              {campaigns.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.title} ({formatMoney(c.budget)})
                </option>
              ))}
            </select>
          </label>

          {campaignsError ? (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,90,90,0.35)',
                background: 'rgba(255,90,90,0.10)',
              }}
            >
              {campaignsError}
            </div>
          ) : null}

          {!isCampaignsLoading && !campaignsError && campaigns.length === 0 ? (
            <div style={{ opacity: 0.85 }}>
              No campaigns yet. Create one at <strong style={{ color: 'white' }}>/campaigns/new</strong>.
            </div>
          ) : null}

          {offerError ? (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,90,90,0.35)',
                background: 'rgba(255,90,90,0.10)',
              }}
            >
              {offerError}
            </div>
          ) : null}

          {offerMessage ? (
            <div
              role="status"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(90,255,160,0.25)',
                background: 'rgba(90,255,160,0.08)',
              }}
            >
              {offerMessage}
            </div>
          ) : null}
        </div>
      ) : null}

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

      {!isLoading && !error && items.length === 0 ? (
        <p style={{ marginTop: 12, opacity: 0.85 }}>No influencer profiles yet.</p>
      ) : null}

      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {items.map((p) => (
          <article
            key={p.user_id}
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: 0.3 }}>
              {p.user_id}
            </div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>
              {p.niche || '—'}
            </div>

            <div style={{ marginTop: 10, display: 'grid', gap: 6, opacity: 0.9 }}>
              <div>
                <span style={{ opacity: 0.75 }}>Followers:</span>{' '}
                <strong style={{ color: 'white' }}>{formatInt(p.followers)}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.75 }}>Price:</span>{' '}
                <strong style={{ color: 'white' }}>{formatMoney(p.price)}</strong>
              </div>
            </div>

            {role === 'brand' ? (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  disabled={!canSendOffers || sendingId === p.user_id}
                  onClick={() => sendOffer(p.user_id)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.16)',
                    background:
                      canSendOffers && sendingId !== p.user_id
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(255,255,255,0.06)',
                    color: 'white',
                    cursor:
                      canSendOffers && sendingId !== p.user_id ? 'pointer' : 'not-allowed',
                  }}
                >
                  {sendingId === p.user_id ? 'Sending…' : 'Send offer'}
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

