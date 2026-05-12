import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

export default function DashboardPage() {
  const { role } = useAuth()

  return (
    <section>
      <h1 style={{ margin: 0 }}>Dashboard</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Starter page for your app’s main experience.
      </p>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Link to="/influencer-dashboard">Go to influencer dashboard</Link>
          <Link to="/brand-profile">Edit brand profile</Link>
          {role === 'brand' ? <Link to="/campaigns/new">Create campaign</Link> : null}
          {role === 'brand' ? <Link to="/brand-dashboard">Go to brand dashboard</Link> : null}
        </div>
      </div>
    </section>
  )
}
