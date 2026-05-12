import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { upsertProfileRole } from '../services/profiles'
import '../styles/ui.css'

export default function RolePage() {
  const navigate = useNavigate()
  const { user, role, setRole } = useAuth()
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function choose(nextRole) {
    if (!user?.id) return

    setError('')
    setIsSaving(true)
    try {
      await upsertProfileRole({ userId: user.id, role: nextRole })
      window.localStorage.setItem('role', nextRole)
      setRole(nextRole)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Failed to save role')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="card3d" style={{ padding: 18 }}>
      <h1 className="pageTitle">Choose your role</h1>
      <p className="pageSubtitle">
        Pick what describes you best. You can start immediately — we’ll tailor the app for you.
      </p>

      <div className="choiceGrid">
        <button
          type="button"
          className="choiceTile"
          disabled={isSaving}
          onClick={() => choose('influencer')}
        >
          <div className="choiceTile__title">Influencer</div>
          <div className="choiceTile__desc">
            Build your profile, receive offers, and track gig status in your dashboard.
          </div>
          <div className="pill">Best for creators</div>
        </button>

        <button
          type="button"
          className="choiceTile"
          disabled={isSaving}
          onClick={() => choose('brand')}
        >
          <div className="choiceTile__title">Brand</div>
          <div className="choiceTile__desc">
            Create campaigns, browse influencers, and send offers with one click.
          </div>
          <div className="pill">Best for businesses</div>
        </button>
      </div>

      {error ? (
        <div role="alert" className="noticeError3d">
          {error}
        </div>
      ) : null}

      {role ? (
        <div className="pill" style={{ marginTop: 12 }}>
          Current role: <strong style={{ color: 'white' }}>{role}</strong>
        </div>
      ) : null}
    </section>
  )
}
