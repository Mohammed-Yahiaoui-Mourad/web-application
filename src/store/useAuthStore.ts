import { create } from 'zustand'
import { api } from '../lib/api'

interface AuthStore {
  user: any;
  profile: any;
  loading: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId?: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async () => {
    try {
      const data = await api.get('/api/auth/me')
      set({ profile: data })
      return data
    } catch (error) {
      console.error('fetchProfile error:', error)
      set({ profile: null })
      return null
    }
  },

  signOut: async () => {
    localStorage.removeItem('access_token')
    set({ user: null, profile: null })
  },
}))

export default useAuthStore
