import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail, signOut } from '../services/auth'

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase()

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const canSubmit = useMemo(() => {
    if (isLoading) return false
    if (!email.trim() || password.length < 6) return false
    return true
  }, [email, isLoading, password])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { session } = await signInWithEmail({ email: email.trim(), password })
      const signedInEmail = session?.user?.email?.toLowerCase() || ''

      if (!adminEmail) {
        await signOut()
        setError('Admin email is not configured. Set VITE_ADMIN_EMAIL in .env.')
        return
      }

      if (signedInEmail !== adminEmail) {
        await signOut()
        setError('Access denied. This admin login is restricted.')
        return
      }

      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Admin login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-pink-500/10 via-orange-400/10 to-indigo-500/10 blur-3xl rounded-full" />
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-200 p-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 mb-4">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Admin Only
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Admin login
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Restricted access.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? 'Signing in…' : 'Sign in as admin'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-4 text-sm text-neutral-600">
            <span>Not admin?</span>
            <Link to="/start" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
              Back to start
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

