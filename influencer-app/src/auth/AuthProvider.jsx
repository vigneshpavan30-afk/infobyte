import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { getProfileRole } from '../services/profiles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [isRoleLoading, setIsRoleLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const { data, error } = await supabase.auth.getSession()
      if (!isMounted) return

      if (error) {
        setSession(null)
        setRole(null)
        setIsLoading(false)
        return
      }

      setSession(data.session ?? null)
      setIsLoading(false)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadRole() {
      const userId = session?.user?.id
      if (!userId) {
        setRole(null)
        setIsRoleLoading(false)
        return
      }

      setIsRoleLoading(true)
      try {
        const nextRole = await getProfileRole({ userId })
        if (cancelled) return
        setRole(nextRole)
        if (nextRole) window.localStorage.setItem('role', nextRole)
        else window.localStorage.removeItem('role')
      } catch {
        if (cancelled) return
        setRole(null)
      } finally {
        if (!cancelled) setIsRoleLoading(false)
      }
    }

    loadRole()
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      role,
      isRoleLoading,
      setRole,
    }),
    [session, isLoading, role, isRoleLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider />')
  return ctx
}

