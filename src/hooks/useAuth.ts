import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'
import { MOCK_USERS } from '../lib/autoLogin'

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, fetchProfile, signOut } =
    useAuthStore()

  useEffect(() => {
    let mounted = true

    async function init() {
      let token = localStorage.getItem('access_token')
      
      if (!token) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        // Try to fetch the profile
        const profileData = await fetchProfile()
        if (mounted) {
          if (profileData) {
            setUser({ email: profileData.email, id: profileData.id })
            console.log('✅ User authenticated:', profileData.email)
          } else {
            // If profile fetch fails, use mock data
            const role = localStorage.getItem('auto_login_role') || 'admin'
            const mockUser = role === 'donor' ? MOCK_USERS.donor : MOCK_USERS.admin
            setUser({ email: mockUser.email, id: mockUser.id })
            setProfile(mockUser)
            console.log('⚠️ Using mock user data for:', mockUser.email)
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        if (mounted && token) {
          // If we have a token but fetch fails, use mock data for dev
          const role = localStorage.getItem('auto_login_role') || 'admin'
          const mockUser = role === 'donor' ? MOCK_USERS.donor : MOCK_USERS.admin
          setUser({ email: mockUser.email, id: mockUser.id })
          setProfile(mockUser)
          console.log('✅ Using mock user (token exists, fetch failed):', mockUser.email)
        } else if (mounted) {
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
