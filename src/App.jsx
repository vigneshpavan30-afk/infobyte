import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider.jsx'

import DashboardLayout from './components/DashboardLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import StartPage from './pages/StartPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  return (
    <Routes>
      <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/start" element={!isAuthenticated ? <StartPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
