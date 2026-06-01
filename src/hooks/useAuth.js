import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/useAuthStore'

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, fetchProfile, signOut } =
    useAuthStore()

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading, fetchProfile])

  return { user, profile, loading, signOut }
}
