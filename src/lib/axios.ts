import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer token to every outgoing request.
// tenant_id is NEVER included — backend resolves it from the JWT.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, attempt a transparent token refresh then replay the original request.
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (!originalRequest) return Promise.reject(error)
      originalRequest._retry = true
      try {
        const base = import.meta.env.VITE_API_BASE_URL ?? ''
        const { data } = await axios.post<{ accessToken: string }>(`${base}/api/v1/auth/refresh`)
        const { user } = useAuthStore.getState()
        if (!user) {
          useAuthStore.getState().clearAuth()
          return Promise.reject(error)
        }
        useAuthStore.getState().setAuth(user, data.accessToken)
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().clearAuth()
      }
    }
    return Promise.reject(error)
  },
)
