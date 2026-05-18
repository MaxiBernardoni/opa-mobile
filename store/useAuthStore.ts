import { create } from 'zustand'
import { Profile } from '../types'

interface AuthState {
  user: Profile | null
  setUser: (user: Profile | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
