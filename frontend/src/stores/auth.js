import { create } from 'zustand'
import client from '../api/client'

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// localStorage keys 'token' and 'user' remain the single source of truth,
// same as in the original Pinia store: hydrated on init, purged on logout.
export const useAuthStore = create((set, get) => ({
    user: safeParse(localStorage.getItem('user')),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,

    async login(username, password) {
        set({ loading: true, error: null })
        try {
            const response = await client.post('/api/auth/login', { username, password })
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            set({ token: response.data.token, user: response.data.user })
            return true
        } catch (err) {
            set({ error: err.response?.data?.error || 'Login failed' })
            return false
        } finally {
            set({ loading: false })
        }
    },

    async fetchMe() {
        const { token } = get()
        if (!token) return false
        try {
            const res = await client.get('/api/auth/me')
            localStorage.setItem('user', JSON.stringify(res.data))
            set({ user: res.data })
            return true
        } catch {
            get().logout()
            return false
        }
    },

    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null })
    },
}))
