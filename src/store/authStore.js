import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('user'),
  login: (userData) => { localStorage.setItem('user', JSON.stringify(userData)); localStorage.setItem('token', `token-${userData.id}`); set({ user: userData, isAuthenticated: true }) },
  logout: () => { localStorage.removeItem('user'); localStorage.removeItem('token'); set({ user: null, isAuthenticated: false }) },
  updateUser: (userData) => { localStorage.setItem('user', JSON.stringify(userData)); set({ user: userData }) },
  hasRole: (...roles) => { const user = get().user; return user && roles.includes(user.role) },
  isAdmin: () => get().user?.role === 'admin',
}))

export default useAuthStore
