import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3001', timeout: 10000, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user) { config.headers['X-User-Id'] = user.id; config.headers['X-User-Role'] = user.role }
  return config
})

api.interceptors.response.use(r => r, (error) => {
  if (error.response?.status === 401) { localStorage.removeItem('user'); window.location.href = '/login' }
  return Promise.reject(error)
})

export default api
