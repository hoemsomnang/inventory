import { defineStore } from 'pinia'
import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isViewer: (state) => state.user?.role === 'VIEWER',
  },

  actions: {
    async login(username, password) {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, { username, password })
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.user = { username: data.username, email: data.email, role: data.role }
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async refresh() {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: this.refreshToken
      })
      this.accessToken = data.accessToken
      localStorage.setItem('accessToken', data.accessToken)
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }
})
