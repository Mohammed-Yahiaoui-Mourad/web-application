import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, fetchProfile, signOut } =
    useAuthStore()

  useEffect(() => {
    let mounted = true

    async function init() {
      let token = localStorage.getItem('access_token')
      
      // Auto-mock login for development
      const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
      if (!token && import.meta.env.DEV && useMocks) {
        token = 'mock-token'
        localStorage.setItem('access_token', token)
        console.log('[MOCK] Auto-logged in for development')
      }

      if (!token) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const profileData = await fetchProfile()
        if (mounted) {
          if (profileData) {
            setUser({ email: profileData.email, id: profileData.id })
          } else {
            setUser(null)
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [setUser, setProfile, setLoading, fetchProfile])

  return { user, profile, loading, signOut }
}
