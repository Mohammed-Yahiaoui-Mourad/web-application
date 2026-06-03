import { create } from 'zustand'
import { authService } from '../services/api-service'

interface AuthStore {
  user: any;
  profile: any;
  loading: boolean;
  token: string | null;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId?: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  loading: true,
  token: localStorage.getItem('access_token'),

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setToken: (token) => {
    if (token) {
      authService.setToken(token)
      localStorage.setItem('access_token', token)
    } else {
      authService.logout()
      localStorage.removeItem('access_token')
    }
    set({ token })
  },
  setLoading: (loading) => set({ loading }),

  fetchProfile: async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return null
      
      // Fetch from /api/auth/me endpoint
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.error('Profile fetch failed:', response.status)
        return null
      }
      
      const json = await response.json()
      
      // Handle both { success, data } format and direct data format
      const profile = json.data || json
      
      if (profile) {
        set({ profile })
      }
      
      return profile
    } catch (error) {
      console.error('fetchProfile error:', error)
      return null
    }
  },

  signOut: async () => {
    authService.logout()
    set({ user: null, profile: null, token: null })
  },
}))

export default useAuthStore
