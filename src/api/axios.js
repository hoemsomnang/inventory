import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

const api = axios.create({
  // Use localhost when running 'npm run dev', but use the Render backend in production (GitHub Pages)
  baseURL: 'https://inventory-server-vfc0.onrender.com/api',
  //baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach access token to every request
api.interceptors.request.use(config => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

// Handle 401 — try refresh, else redirect to login
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const auth = useAuthStore()
        await auth.refresh()
        original.headers.Authorization = `Bearer ${auth.accessToken}`
        return api(original)
      } catch {
        useAuthStore().logout()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
