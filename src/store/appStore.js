import { create } from 'zustand'

const useAppStore = create((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: localStorage.getItem('theme') || 'light',
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => { localStorage.setItem('theme', theme); document.documentElement.classList.toggle('dark', theme === 'dark'); set({ theme }) },
  toggleTheme: () => set(s => { const t = s.theme === 'light' ? 'dark' : 'light'; localStorage.setItem('theme', t); document.documentElement.classList.toggle('dark', t === 'dark'); return { theme: t } }),
}))

export default useAppStore
