import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, User, Briefcase, ShieldAlert } from 'lucide-react'

export default function StartPage() {
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || 'login' // defaults to login
  const isSignup = action === 'signup'

  // If signup, redirect to /signup?type=X
  // If login, redirect to /login?type=X
  const getPath = (type) => (isSignup ? `/signup?type=${type}` : `/login?type=${type}`)

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex items-center justify-center p-6 selection:bg-pink-500/30 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-pink-500/10 via-orange-400/10 to-indigo-500/10 blur-3xl rounded-full" />
      
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              {isSignup ? 'Choose your role' : 'Choose your login'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4">
            Welcome to Infobyte
          </h1>
          <p className="text-lg text-neutral-600 max-w-xl mx-auto">
            {isSignup
              ? 'Pick a role to create your account. Your experience will be personalized based on the role you choose.'
              : 'Pick one option to continue. Your experience will be personalized based on the role you choose.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to={getPath('influencer')} className="group outline-none">
            <article className="h-full flex flex-col p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-neutral-300">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-pink-50 border border-neutral-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="h-7 w-7 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Influencer {isSignup ? 'Signup' : 'Login'}
              </h2>
              <p className="text-neutral-600 mb-8 flex-1">
                Create your profile, receive offers, and track gig status.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="inline-flex px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                  Creator
                </span>
                <div className="h-10 w-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </article>
          </Link>

          <Link to={getPath('brand')} className="group outline-none">
            <article className="h-full flex flex-col p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-neutral-300">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 border border-neutral-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-7 w-7 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Brand {isSignup ? 'Signup' : 'Login'}
              </h2>
              <p className="text-neutral-600 mb-8 flex-1">
                Create campaigns, browse influencers, and send offers.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="inline-flex px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                  Brand
                </span>
                <div className="h-10 w-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </article>
          </Link>

          {!isSignup && (
            <Link to="/admin-login" className="group outline-none">
              <article className="h-full flex flex-col p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-neutral-300">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 border border-neutral-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="h-7 w-7 text-slate-700" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                  Admin Login
                </h2>
                <p className="text-neutral-600 mb-8 flex-1">
                  Restricted access for the owner only.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="inline-flex px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                    Private
                  </span>
                  <div className="h-10 w-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </article>
            </Link>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Link to="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
