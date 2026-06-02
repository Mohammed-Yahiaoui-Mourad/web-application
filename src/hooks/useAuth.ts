import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, fetchProfile, signOut } =
    useAuthStore()

  useEffect(() => {
    let mounted = true

    async function init() {
      const token = localStorage.getItem('access_token')
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
