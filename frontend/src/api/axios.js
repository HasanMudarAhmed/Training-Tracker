import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true, // send httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/refresh/`,
          {},
          { withCredentials: true }
        )
        return api(original)
      } catch {
        // Refresh failed — redirect to login only if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
