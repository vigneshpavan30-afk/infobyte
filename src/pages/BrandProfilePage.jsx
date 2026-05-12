import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getBrandProfile, upsertBrandProfile } from '../services/brandProfiles'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  outline: 'none',
}

export default function BrandProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [companyName, setCompanyName] = useState('')
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
        const profile = await getBrandProfile({ userId })
        if (cancelled) return
        setCompanyName(profile?.company_name ?? '')
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
    return companyName.trim().length > 0
  }, [companyName, isLoading, isSaving])

  async function onSubmit(e) {
    e.preventDefault()
    if (!userId) return
    setError('')
    setMessage('')
    setIsSaving(true)
    try {
      await upsertBrandProfile({ userId, companyName: companyName.trim() })
      setMessage('Saved.')
    } catch (err) {
      setError(err?.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section>
        <h1 style={{ margin: 0 }}>Brand profile</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>Loading…</p>
      </section>
    )
  }

  return (
    <section style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Brand profile</h1>
        <button type="button" onClick={() => navigate('/dashboard')}>
          Back
        </button>
      </div>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Add your company details.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Company name</span>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
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

