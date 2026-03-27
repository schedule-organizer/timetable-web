import { create } from 'zustand'
import type { UserDto } from '@/types/auth.types'

interface AuthStore {
  user: UserDto | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: UserDto, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}))
