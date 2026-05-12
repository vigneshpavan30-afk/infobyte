import { useMemo, useState, useEffect } from 'react'
import { signOut } from '../services/auth'
import { useAuth } from '../auth/AuthProvider'
import { listMyCampaigns, createCampaign } from '../services/campaigns'
import { listInfluencerProfiles, getInfluencerProfile, upsertInfluencerProfile } from '../services/influencerProfiles'
import { getMessages, sendMessage, subscribeToMessages } from '../services/messages'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function DashboardView({ role, onNavigateToCreateCampaign }) {
  const { user } = useAuth()
  const isBrand = role === 'brand'
  const [stats, setStats] = useState({ count: 0, budget: 0 })

  useEffect(() => {
    async function loadStats() {
      try {
        const campaigns = await listMyCampaigns({ userId: user?.id })
        const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
        setStats({ count: campaigns.length, budget: totalBudget })
      } catch (err) {
        console.error(err)
      }
    }
    if (user && isBrand) loadStats()
  }, [user, isBrand])

  const brandStats = [
    { label: 'Active Campaigns', value: stats.count, trend: '+2', trendUp: true },
    { label: 'Total Budget', value: `$${stats.budget.toLocaleString()}`, trend: '12%', trendUp: true },
    { label: 'Active Gigs', value: '0', trend: '0', trendUp: true },
  ]

  const influencerStats = [
    { label: 'Active Gigs', value: '0', trend: '0', trendUp: true },
    { label: 'Total Earned', value: '$0', trend: '0', trendUp: true },
    { label: 'Pending Offers', value: '0', trend: '0', trendUp: true },
  ]

  const currentStats = isBrand ? brandStats : influencerStats

  return (
    <section className="mt-6 grid gap-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-bold text-neutral-900">
          {isBrand ? 'Brand Dashboard' : 'Influencer Dashboard'}
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          {isBrand 
            ? "Welcome back! Manage your campaigns and discover the perfect influencers for your brand."
            : "Welcome back! Check out your latest offers from brands and manage your profile."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentStats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{s.label}</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900">{s.value}</div>
            <div className={classNames("mt-2 text-xs font-bold flex items-center gap-1", s.trendUp ? "text-green-600" : "text-red-600")}>
              {s.trend !== '0' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={s.trendUp ? "" : "rotate-180"}>
                  <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                </svg>
              )}
              {s.trend} {s.trend !== '0' && 'this month'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Recent activity</div>
          </div>
          <div className="mt-8 mb-4 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div className="text-sm font-bold text-neutral-700">No recent activity</div>
            <div className="text-xs text-neutral-500 mt-1">Activity will appear here once you start interacting.</div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold">Quick actions</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={isBrand ? onNavigateToCreateCampaign : undefined}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-neutral-50"
            >
              <div className="text-sm font-bold">{isBrand ? 'Create Campaign' : 'Browse campaigns'}</div>
              <div className="mt-1 text-xs text-neutral-600">{isBrand ? 'Start a new promotion' : 'Find new deals'}</div>
            </button>
            <button
              type="button"
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-neutral-50"
            >
              <div className="text-sm font-bold">Edit profile</div>
              <div className="mt-1 text-xs text-neutral-600">Update your details</div>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmptyStateView({ icon, title, description, actionText, onAction }) {
  return (
    <section className="mt-6 grid gap-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
          {icon}
        </div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className={`text-sm text-neutral-500 max-w-sm ${actionText ? 'mb-6' : ''}`}>
          {description}
        </p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-neutral-800 transition active:scale-95"
          >
            {actionText}
          </button>
        )}
      </div>
    </section>
  )
}

function CampaignsView({ isCreating, setIsCreating }) {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await listMyCampaigns({ userId: user?.id })
        setCampaigns(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  const handleLaunch = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      const newCampaign = await createCampaign({
        userId: user.id,
        title: formData.get('title'),
        budget: Number(formData.get('budget')),
        description: formData.get('description'),
      })
      setCampaigns([newCampaign, ...campaigns])
      setIsCreating(false)
    } catch (err) {
      alert("Failed to create campaign: " + err.message)
    }
  }

  if (loading) return <div className="mt-12 text-center text-neutral-500">Loading campaigns...</div>

  if (isCreating) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create New Campaign</h2>
          <button 
            onClick={() => setIsCreating(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition"
          >
            Cancel
          </button>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm max-w-3xl">
          <form className="space-y-6" onSubmit={handleLaunch}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Campaign Title</label>
              <input name="title" required type="text" placeholder="e.g. Summer Collection Launch" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Budget ($)</label>
                <input name="budget" required type="number" placeholder="e.g. 500" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Target Niche</label>
                <input name="niche" required type="text" placeholder="e.g. Fashion, Fitness" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Campaign Description</label>
              <textarea name="description" required rows={4} placeholder="Describe the campaign goals and requirements..." className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors resize-none"></textarea>
            </div>
            <div className="pt-4 flex justify-end">
              <button type="submit" className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-neutral-800 transition active:scale-95">
                Launch Campaign
              </button>
            </div>
          </form>
        </div>
      </section>
    )
  }

  if (campaigns.length === 0) {
    return (
      <EmptyStateView 
        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
        title="No Campaigns Yet" 
        description="You haven't created any campaigns yet. Start one to collaborate with influencers!" 
        actionText="Create Campaign"
        onAction={() => setIsCreating(true)}
      />
    )
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Campaigns</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-neutral-800 transition active:scale-95"
        >
          New Campaign
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div className="font-bold text-neutral-900 truncate pr-4">{campaign.title}</div>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-neutral-500 text-xs">Budget</div>
                <div className="font-semibold">${campaign.budget}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MessagesView({ initialContact }) {
  const { user } = useAuth()
  const [activeChat, setActiveChat] = useState(initialContact)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    async function loadMessages() {
      if (!activeChat) return
      try {
        const data = await getMessages({ userId: user.id, otherId: activeChat.user_id || activeChat.id })
        setMessages(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadMessages()
  }, [activeChat, user])

  useEffect(() => {
    const sub = subscribeToMessages(user.id, (msg) => {
      if (activeChat && (msg.sender_id === activeChat.user_id || msg.sender_id === activeChat.id)) {
        setMessages(prev => [...prev, msg])
      }
    })
    return () => sub.unsubscribe()
  }, [user, activeChat])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return
    
    const content = newMessage
    setNewMessage('')
    
    try {
      const msg = await sendMessage({
        senderId: user.id,
        receiverId: activeChat.user_id || activeChat.id,
        content
      })
      setMessages(prev => [...prev, msg])
    } catch (err) {
      alert("Failed to send message: " + err.message)
    }
  }

  return (
    <section className="mt-6 flex h-[calc(100vh-200px)] gap-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 rounded-2xl border border-neutral-200 bg-white flex flex-col shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 font-bold text-neutral-900">Conversations</div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-neutral-50/50">
          {activeChat && (
             <button 
              className="w-full text-left p-3 rounded-xl bg-neutral-900 text-white font-bold transition flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {activeChat.name?.substring(0, 2) || 'IN'}
              </div>
              <div className="truncate">
                <div>{activeChat.name || 'Influencer'}</div>
                <div className="text-[10px] opacity-60 font-medium">Active now</div>
              </div>
            </button>
          )}
          {!activeChat && (
            <div className="p-8 text-center text-neutral-400 text-sm">No active chats</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white flex flex-col shadow-sm">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-neutral-100 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-xs border border-neutral-200">
                {activeChat.name?.substring(0, 2) || 'IN'}
              </div>
              <div>
                <div className="font-bold text-neutral-900">{activeChat.name || 'Influencer'}</div>
                <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/30">
              {messages.map((m) => (
                <div key={m.id} className={classNames("flex", m.sender_id === user.id ? "justify-end" : "justify-start")}>
                  <div className={classNames(
                    "max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                    m.sender_id === user.id ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-900"
                  )}>
                    {m.content}
                    <div className={classNames("text-[10px] mt-1 opacity-50", m.sender_id === user.id ? "text-right" : "text-left")}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <p className="text-xs font-medium">No messages yet. Say hello!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-neutral-100 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:border-neutral-900 focus:bg-white focus:outline-none transition-all" 
              />
              <button 
                type="submit"
                className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-md hover:bg-neutral-800 transition active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rotate-45 -translate-y-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/30">
            <div className="h-16 w-16 rounded-full bg-white border border-neutral-200 flex items-center justify-center mb-4 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 className="font-bold text-neutral-900">Select a Conversation</h3>
            <p className="text-xs mt-1">Choose an influencer from your contacts to start chatting.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function FindInfluencersView({ onMessageInfluencer }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await listInfluencerProfiles()
        setInfluencers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = influencers.filter(inf => 
    inf.niche?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="mt-12 text-center text-neutral-500">Searching for influencers...</div>

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Find Influencers</h2>
      </div>
      
      <div className="mb-6 relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          type="text" 
          placeholder="Search by niche..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white pl-12 pr-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none transition-colors shadow-sm" 
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-500 text-sm">
            No influencers found. Try searching for a different niche.
          </div>
        ) : (
          filtered.map(inf => (
            <div key={inf.user_id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col group">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-neutral-100 to-neutral-200 border border-neutral-200 text-neutral-500 font-bold flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-neutral-900 truncate">Influencer</div>
                  <div className="text-xs text-neutral-500 truncate">Verified Creator</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="rounded-xl bg-neutral-50 p-3">
                  <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-tight">Niche</div>
                  <div className="font-bold truncate text-neutral-800">{inf.niche}</div>
                </div>
                <div className="col-span-2 rounded-xl border border-neutral-100 p-3 flex justify-between items-center bg-white">
                  <div>
                    <div className="text-neutral-400 text-[10px] font-bold uppercase tracking-tight">Followers</div>
                    <div className="font-extrabold text-neutral-900">{inf.followers}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-neutral-400 text-[10px] font-bold uppercase tracking-tight">Est. Price</div>
                    <div className="font-extrabold text-neutral-900">${inf.price}</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                <button 
                  onClick={() => onMessageInfluencer(inf)}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 transition"
                >
                  Message
                </button>
                <button 
                  onClick={() => alert(`Request sent!`)}
                  className="rounded-xl bg-neutral-900 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition active:scale-95"
                >
                  Request
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function PaymentsView() {
  const stripe = useStripe()
  const elements = useElements()
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)
    
    try {
      // 1. Call your backend to create a PaymentIntent
      const response = await fetch('http://localhost:4000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10 }), // $10.00 test payment
      });
      
      const { clientSecret, error: backendError } = await response.json();
      if (backendError) throw new Error(backendError);

      // 2. Confirm the payment on the frontend
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        alert(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        alert('Payment successful! Payment ID: ' + paymentIntent.id);
        setIsAdding(false);
      }
    } catch (err) {
      alert("Payment failed: " + err.message);
    }
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Spend</div>
          <div className="mt-2 text-2xl font-extrabold">$0.00</div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pending Payments</div>
          <div className="mt-2 text-2xl font-extrabold">$0.00</div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Credits Available</div>
          <div className="mt-2 text-2xl font-extrabold">$0.00</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900">Transaction History</h3>
            </div>
            <div className="p-12 text-center text-neutral-400 text-sm">
               No transactions found. Start a campaign to see history.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-neutral-900 mb-4">Payment Methods</h3>
            
            {isAdding ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 border border-neutral-200 rounded-xl bg-neutral-50">
                  <CardElement options={{ style: { base: { fontSize: '14px' } } }} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-xl bg-neutral-900 text-white py-2 text-sm font-bold">Save</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 rounded-xl border border-neutral-200 py-2 text-sm font-bold">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-8 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
                   <div className="text-xs text-neutral-400 mb-3 font-medium">No payment methods saved</div>
                   <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition flex items-center justify-center gap-2"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfileView({ role }) {
  const { user } = useAuth()
  const isBrand = role === 'brand'
  const [profile, setProfile] = useState({ niche: '', followers: '', price: '', platform: 'Instagram' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!isBrand) {
        try {
          const data = await getInfluencerProfile({ userId: user.id })
          if (data) setProfile(data)
        } catch (err) {
          console.error(err)
        }
      }
      setLoading(false)
    }
    if (user) load()
  }, [user, isBrand])

  const handleSave = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      if (!isBrand) {
        await upsertInfluencerProfile({
          userId: user.id,
          niche: formData.get('niche'),
          followers: formData.get('followers'),
          price: Number(formData.get('price')),
          platform: formData.get('platform')
        })
      }
      alert("Profile updated successfully!")
    } catch (err) {
      alert("Failed to update profile: " + err.message)
    }
  }

  if (loading) return <div className="mt-12 text-center text-neutral-500">Loading profile...</div>

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm max-w-3xl">
        <h2 className="text-xl font-bold mb-6">{isBrand ? 'Brand Profile' : 'Influencer Profile'}</h2>
        
        <form className="space-y-6" onSubmit={handleSave}>
          <div className="flex items-center gap-6 pb-6 border-b border-neutral-100">
            <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 overflow-hidden relative group cursor-pointer">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs font-bold transition-all">
                Upload
              </div>
            </div>
            <div>
              <div className="font-bold text-lg text-neutral-900">{isBrand ? 'My Brand' : 'My Influencer Page'}</div>
              <div className="text-sm text-neutral-500">Manage your public information and settings</div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">{isBrand ? 'Brand Name' : 'Full Name'}</label>
              <input type="text" placeholder={isBrand ? "e.g. Nike" : "e.g. Jane Doe"} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
            </div>
            {isBrand ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Company Website</label>
                <input type="url" placeholder="https://example.com" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Platform</label>
                <select name="platform" defaultValue={profile.platform} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors">
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>YouTube</option>
                </select>
              </div>
            )}
          </div>

          {!isBrand && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Niche</label>
                <input name="niche" defaultValue={profile.niche} type="text" placeholder="e.g. Fashion" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Followers Count</label>
                <input name="followers" defaultValue={profile.followers} type="text" placeholder="e.g. 50K" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Price per Post ($)</label>
                <input name="price" defaultValue={profile.price} type="number" placeholder="e.g. 200" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">{isBrand ? 'About the Brand' : 'Bio / Content Style'}</label>
            <textarea 
              rows={4} 
              placeholder={isBrand ? "Tell influencers about your mission and products..." : "I create content about fashion, tech, and lifestyle..."}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-neutral-800 transition active:scale-95">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default function DashboardLayout() {
  const { role } = useAuth()
  const isBrand = role === 'brand'

  const items = useMemo(() => {
    if (isBrand) {
      return [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'campaigns', label: 'My Campaigns' },
        { key: 'messages', label: 'Messages' },
        { key: 'find-influencers', label: 'Find Influencers' },
        { key: 'payments', label: 'Payments & Billing' },
        { key: 'profile', label: 'Brand Profile' },
      ]
    }
    return [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'offers', label: 'Offers' },
      { key: 'messages', label: 'Messages' },
      { key: 'profile', label: 'My Profile' },
    ]
  }, [isBrand])

  const [active, setActive] = useState('dashboard')
  const title = useMemo(() => items.find((i) => i.key === active)?.label || 'Dashboard', [active, items])
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [activeChatInfluencer, setActiveChatInfluencer] = useState(null)

  const handleMessageInfluencer = (influencer) => {
    setActiveChatInfluencer(influencer)
    setActive('messages')
  }

  async function onLogout() {
    try {
      await signOut()
    } finally {
      window.location.reload()
    }
  }

  function Nav({ onNavigate }) {
    return (
      <nav className="mt-4 space-y-1">
        {items.map((it) => {
          const isActive = it.key === active
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => {
                setActive(it.key)
                if (it.key === 'campaigns') setIsCreatingCampaign(false)
                onNavigate?.()
              }}
              className={classNames(
                'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-neutral-900 text-white shadow-md shadow-black/10'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              )}
            >
              <span>{it.label}</span>
              {isActive ? (
                <span className="h-2 w-2 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500 shadow-sm" />
              ) : null}
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900">
      {/* Mobile overlay */}
      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(84vw,320px)] bg-white shadow-2xl ring-1 ring-black/10 flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500 shadow-[0_4px_10px_rgba(221,42,123,0.3)]" />
                <div className="text-base font-extrabold tracking-wide">Infobyte {isBrand ? 'Brand' : 'Influencer'}</div>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 transition"
                onClick={() => setIsMobileNavOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-4 flex-1 overflow-y-auto">
              <Nav onNavigate={() => setIsMobileNavOpen(false)} />
            </div>
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        {/* Sidebar */}
        <aside className="hidden w-[280px] shrink-0 border-r border-neutral-200 bg-white/80 p-5 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition duration-300 cursor-pointer">
            <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500 shadow-[0_4px_10px_rgba(221,42,123,0.3)]" />
            <div className="text-base font-extrabold tracking-wide">Infobyte</div>
          </div>

          <div className="flex-1 mt-6">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 px-2">
              {isBrand ? 'Brand Menu' : 'Menu'}
            </div>
            <Nav />
          </div>

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-5xl mx-auto w-full">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-700 shadow-sm hover:bg-neutral-50 md:hidden"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              <div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Overview</div>
                <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button 
                className="h-10 w-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition shadow-sm relative"
                onClick={() => alert("You have no new notifications")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-neutral-200">
                <button 
                  onClick={() => setActive('profile')}
                  className="h-10 w-10 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-300 p-0.5 shadow-sm hover:scale-105 transition-transform"
                >
                  <div className="h-full w-full rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden text-neutral-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Render Active View */}
          {active === 'dashboard' && <DashboardView role={role} onNavigateToCreateCampaign={() => { setActive('campaigns'); setIsCreatingCampaign(true); }} />}
          
          {/* Brand Views */}
          {active === 'campaigns' && <CampaignsView isCreating={isCreatingCampaign} setIsCreating={setIsCreatingCampaign} />}
          {active === 'find-influencers' && <FindInfluencersView onMessageInfluencer={handleMessageInfluencer} />}

          {/* Influencer Views */}
          {active === 'offers' && (
            <EmptyStateView 
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
              title="No Offers Yet" 
              description="You haven't received any campaign offers from brands yet. Keep your profile updated to attract more opportunities!" 
            />
          )}

          {/* Shared Views */}
          {active === 'messages' && <MessagesView initialContact={activeChatInfluencer} />}
          {active === 'payments' && (
            <Elements stripe={stripePromise}>
              <PaymentsView />
            </Elements>
          )}
          {active === 'profile' && <ProfileView role={role} />}
        </main>
      </div>
    </div>
  )
}


