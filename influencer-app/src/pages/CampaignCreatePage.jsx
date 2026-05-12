import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { createCampaign } from '../services/campaigns'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  outline: 'none',
}

export default function CampaignCreatePage() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const userId = user?.id

  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const canSave = useMemo(() => {
    if (!userId) return false
    if (role !== 'brand') return false
    if (isSaving) return false
    if (!title.trim()) return false
    if (!description.trim()) return false
    const b = Number(budget)
    if (!Number.isFinite(b) || b <= 0) return false
    return true
  }, [budget, description, isSaving, role, title, userId])

  async function onSubmit(e) {
    e.preventDefault()
    if (!userId) return
    if (role !== 'brand') return

    setError('')
    setMessage('')
    setIsSaving(true)
    try {
      await createCampaign({
        userId,
        title: title.trim(),
        budget: Number(budget),
        description: description.trim(),
      })
      setMessage('Campaign created.')
      setTitle('')
      setBudget('')
      setDescription('')
    } catch (err) {
      setError(err?.message || 'Failed to create campaign')
    } finally {
      setIsSaving(false)
    }
  }

  if (role !== 'brand') {
    return (
      <section style={{ maxWidth: 520 }}>
        <h1 style={{ margin: 0 }}>Create campaign</h1>
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
    <section style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Create campaign</h1>
        <button type="button" onClick={() => navigate('/dashboard')}>
          Back
        </button>
      </div>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Post a new campaign for influencers to apply.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summer Launch"
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Budget</span>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            type="number"
            min="1"
            step="0.01"
            placeholder="1000"
            style={inputStyle}
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="What you need, deliverables, timeline, requirements…"
            style={{ ...inputStyle, resize: 'vertical' }}
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
          {isSaving ? 'Creating…' : 'Create campaign'}
        </button>
      </form>
    </section>
  )
}

