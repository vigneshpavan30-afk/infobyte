import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import {
  getInfluencerProfile,
  upsertInfluencerProfile,
} from '../services/influencerProfiles'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  outline: 'none',
}

export default function InfluencerProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [niche, setNiche] = useState('')
  const [followers, setFollowers] = useState('')
  const [price, setPrice] = useState('')
  const [platform, setPlatform] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!userId) return
      setIsLoading(true)
      setError('')
      try {
        const profile = await getInfluencerProfile({ userId })
        if (cancelled) return
        setNiche(profile?.niche ?? '')
        setFollowers(
          profile?.followers === null || profile?.followers === undefined
            ? ''
            : String(profile.followers),
        )
        setPrice(
          profile?.price === null || profile?.price === undefined ? '' : String(profile.price),
        )
        setPlatform(profile?.platform ?? '')
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const canSave = useMemo(() => {
    if (isLoading || isSaving) return false
    if (!niche.trim()) return false
    if (!platform.trim()) return false
    const f = Number(followers)
    if (!Number.isFinite(f) || f < 0) return false
    const p = Number(price)
    if (!Number.isFinite(p) || p < 0) return false
    return true
  }, [followers, isLoading, isSaving, niche, platform, price])

  async function onSubmit(e) {
    e.preventDefault()
    if (!userId) return
    setError('')
    setMessage('')
    setIsSaving(true)
    try {
      await upsertInfluencerProfile({
        userId,
        niche: niche.trim(),
        followers: Number(followers),
        price: Number(price),
        platform: platform.trim(),
      })
      navigate('/influencer-dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section>
        <h1 style={{ margin: 0 }}>Influencer profile</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>Loading…</p>
      </section>
    )
  }

  return (
    <section style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Influencer profile</h1>
        <button type="button" onClick={() => navigate('/dashboard')}>
          Back
        </button>
      </div>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Tell brands what you offer.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Niche</span>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Fitness, Tech, Beauty…"
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Platform</span>
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="TikTok, Instagram, YouTube…"
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Followers</span>
          <input
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            type="number"
            min="0"
            step="1"
            placeholder="0"
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Price</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            style={inputStyle}
            required
          />
        </label>

        {error ? (
          <div
            role="alert"
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255,90,90,0.35)',
              background: 'rgba(255,90,90,0.10)',
            }}
          >
            {error}
          </div>
        ) : null}

        {message ? (
          <div
            role="status"
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(90,255,160,0.25)',
              background: 'rgba(90,255,160,0.08)',
            }}
          >
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSave}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.16)',
            background: canSave ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
            color: 'white',
            cursor: canSave ? 'pointer' : 'not-allowed',
          }}
        >
          {isSaving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </section>
  )
}

