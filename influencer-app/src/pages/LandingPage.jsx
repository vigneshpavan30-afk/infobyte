import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-pink-500/30">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500 shadow-[0_4px_14px_rgba(221,42,123,0.4)]" />
            <span className="text-xl font-extrabold tracking-tight">Infobyte</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/start?action=login"
              className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition"
            >
              Log in
            </Link>
            <Link
              to="/start?action=signup"
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 hover:shadow-lg active:scale-95"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-pink-500/20 via-orange-400/20 to-indigo-500/20 blur-3xl rounded-full" />
        
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm mb-8">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              The #1 Platform for Creators & Brands
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[1.1]">
            Connect. Collaborate.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500">
              Grow together.
            </span>
          </h1>
          
          <p className="mt-8 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Infobyte seamlessly bridges the gap between top-tier influencers and world-class brands. 
            Launch campaigns, track metrics, and scale your reach all in one beautiful platform.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/start?action=signup"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-neutral-900 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-neutral-800 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/start?action=login"
              className="flex items-center justify-center w-full sm:w-auto rounded-full border-2 border-neutral-200 bg-white px-8 py-4 text-base font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300 active:scale-95"
            >
              Sign in to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-white py-24 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Everything you need to scale</h2>
            <p className="mt-4 text-neutral-500">Built for the modern creator economy.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For Brands",
                description: "Discover perfect-fit creators, manage offers, and track ROI in real-time with our powerful dashboard.",
                icon: <TrendingUp className="h-6 w-6 text-pink-500" />
              },
              {
                title: "For Influencers",
                description: "Create a stunning profile, receive inbound opportunities, and manage your pipeline effortlessly.",
                icon: <Users className="h-6 w-6 text-indigo-500" />
              },
              {
                title: "Secure & Transparent",
                description: "Private workspaces, verified metrics, and smooth collaboration tools built right in.",
                icon: <Sparkles className="h-6 w-6 text-orange-500" />
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-neutral-50 border border-neutral-100 hover:shadow-lg transition duration-300">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
