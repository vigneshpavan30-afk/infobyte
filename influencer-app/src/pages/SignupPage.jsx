import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signUpWithEmail } from '../services/auth'
import { upsertProfileRole } from '../services/profiles'
import { useAuth } from '../auth/AuthProvider.jsx'

export default function SignupPage() {
  const navigate = useNavigate()
  const { setRole } = useAuth()
  const [params] = useSearchParams()
  const type = (params.get('type') || '').toLowerCase()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const title =
    type === 'brand'
      ? 'Brand signup'
      : type === 'influencer'
        ? 'Influencer signup'
        : 'Sign up'

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length >= 6 && !isLoading,
    [email, password, isLoading],
  )

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)
    try {
      const { user, session } = await signUpWithEmail({ email: email.trim(), password })

      if (!session && user) {
        setMessage('Check your email to confirm your account, then sign in.')
        return
      }

      const userId = session?.user?.id
      if (userId && (type === 'brand' || type === 'influencer')) {
        await upsertProfileRole({ userId, role: type })
        window.localStorage.setItem('role', type)
        setRole(type)
        navigate(type === 'brand' ? '/brand-dashboard' : '/influencer-dashboard', {
          replace: true,
        })
        return
      }

      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Sign up failed')
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
            <span className="h-2 w-2 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Create your account
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Use email and password to get started.
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
              placeholder="you@example.com"
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
              {message}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full bg-neutral-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-4 text-sm text-neutral-600">
            <span>Already have an account?</span>
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
