import { useState, useEffect, useRef } from 'react'
import useAuthStore from '@/store/authStore'
import useAppStore from '@/store/appStore'
import api from '@/api/client'
import { formatDateTime } from '@/lib/utils'
import { Menu, Bell, Sun, Moon, X, Check, Clock } from 'lucide-react'

export default function Header() {
  const { user } = useAuthStore()
  const { toggleSidebar, theme, setTheme } = useAppStore()
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [time, setTime] = useState(new Date())
  const notifRef = useRef(null)

  useEffect(() => {
    api.get('/notifikasi').then(r => setNotifications(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const dayName = days[time.getDay()]
  const date = time.getDate()
  const month = months[time.getMonth()]
  const year = time.getFullYear()
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"><Menu className="w-5 h-5" /></button>
        <div className="hidden sm:flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-primary animate-pulse" />
          <div className="leading-tight">
            <span className="font-mono font-bold text-foreground tabular-nums">{hours}:{minutes}:<span className="text-primary animate-pulse">{seconds}</span></span>
            <span className="text-muted-foreground ml-2">{dayName}, {date} {month} {year}</span>
          </div>
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
