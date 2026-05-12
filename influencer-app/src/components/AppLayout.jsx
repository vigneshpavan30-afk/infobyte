import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import '../styles/ui.css'
import { signOut } from '../services/auth'

export default function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { role, isAuthenticated } = useAuth()

  const hideChrome =
    !isAuthenticated &&
    (pathname === '/start' ||
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/admin-login')

  async function onLogout() {
    try {
      await signOut()
    } finally {
      navigate('/start', { replace: true })
    }
  }

  return (
    <div className="appShell">
      <div className="appShell__content">
        {!hideChrome ? (
          <header className="topbar">
            <div className="topbar__inner">
              <div className="brand">
                <span className="brandDot" aria-hidden="true" />
                Infobyte
              </div>
              {isAuthenticated ? (
                <nav className="nav">
                  <Link
                    to="/dashboard"
                    className={`navLink ${pathname === '/dashboard' ? 'navLink--active' : ''}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/influencers"
                    className={`navLink ${pathname === '/influencers' ? 'navLink--active' : ''}`}
                  >
                    Influencers
                  </Link>
                  <Link
                    to="/influencer-profile"
                    className={`navLink ${
                      pathname === '/influencer-profile' ? 'navLink--active' : ''
                    }`}
                  >
                    Influencer profile
                  </Link>
                  <Link
                    to="/brand-profile"
                    className={`navLink ${
                      pathname === '/brand-profile' ? 'navLink--active' : ''
                    }`}
                  >
                    Brand profile
                  </Link>
                  {role === 'brand' ? (
                    <>
                      <Link
                        to="/brand-dashboard"
                        className={`navLink ${
                          pathname === '/brand-dashboard' ? 'navLink--active' : ''
                        }`}
                      >
                        Brand dashboard
                      </Link>
                      <Link
                        to="/campaigns/new"
                        className={`navLink ${
                          pathname === '/campaigns/new' ? 'navLink--active' : ''
                        }`}
                      >
                        New campaign
                      </Link>
                    </>
                  ) : null}

                  <button type="button" className="navLink" onClick={onLogout}>
                    Logout
                  </button>
                </nav>
              ) : null}
            </div>
          </header>
        ) : null}

        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
