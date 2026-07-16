import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import useAppStore from '@/store/appStore'
import api from '@/api/client'
import { formatDateTime } from '@/lib/utils'
import { Menu, Bell, Search, Sun, Moon, X, Check } from 'lucide-react'

export default function Header() {
  const { user } = useAuthStore()
  const { toggleSidebar, theme, setTheme } = useAppStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef(null)

  useEffect(() => { api.get('/notifikasi').then(r => setNotifications(r.data)).catch(() => {}) }, [])

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const unread = notifications.filter(n => n.status === 'unread').length

  const markRead = async (id) => {
    await api.patch(`/notifikasi/${id}`, { status: 'read' })
    setNotifications(p => p.map(n => n.id === id ? { ...n, status: 'read' } : n))
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"><Menu className="w-5 h-5" /></button>
        <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari barang, supplier..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(`/barang?search=${encodeURIComponent(searchQuery)}`); setSearchQuery('') } }}
            className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="p-2 hover:bg-muted rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifikasi</h3>
                <button onClick={() => setShowNotif(false)}><X className="w-4 h-4" /></button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? <p className="p-4 text-sm text-muted-foreground text-center">Tidak ada notifikasi</p> : notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors ${n.status === 'unread' ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.judul}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.pesan}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.waktu)}</p>
                      </div>
                      {n.status === 'unread' && <button onClick={() => markRead(n.id)} className="p-1 hover:bg-muted-foreground/20 rounded"><Check className="w-3 h-3" /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{user?.nama?.charAt(0)}</div>
          <div className="text-sm">
            <p className="font-medium">{user?.nama}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
