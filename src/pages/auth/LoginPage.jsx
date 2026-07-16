import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import api from '@/api/client'
import { Eye, EyeOff, Loader2, Package, ArrowRight, Shield, BarChart3, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const btnRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.get('/users', { params: { email, password } })
      if (res.data.length > 0) {
        const user = res.data[0]
        if (user.status === 'aktif') { login(user); navigate('/dashboard') }
        else setError('Akun tidak aktif')
      } else setError('Email atau password salah')
    } catch { setError('Gagal terhubung ke server') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/80 to-blue-700 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full animate-float-slow" />
          <div className="absolute top-1/3 -right-16 w-72 h-72 bg-white/5 rounded-full animate-float-medium" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-white/10 rounded-full animate-float-fast" />
          <div className="absolute top-1/2 left-10 w-40 h-40 bg-white/5 rounded-full animate-float-medium" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">StockFlow</span>
          </div>

          {/* Main illustration */}
          <div className="mb-12 flex justify-center">
            <svg viewBox="0 0 400 320" className="w-full max-w-sm animate-float-slow" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Warehouse/shelf */}
              <rect x="60" y="120" width="280" height="180" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
              <line x1="60" y1="180" x2="340" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
              <line x1="60" y1="240" x2="340" y2="240" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
              <line x1="200" y1="120" x2="200" y2="300" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>

              {/* Boxes on shelves */}
              <rect x="80" y="135" width="45" height="40" rx="6" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <text x="102" y="160" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="bold">A1</text>

              <rect x="140" y="140" width="40" height="35" rx="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <text x="160" y="163" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="bold">B2</text>

              <rect x="220" y="130" width="50" height="45" rx="6" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <text x="245" y="158" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="bold">C3</text>

              <rect x="280" y="145" width="45" height="30" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
              <text x="302" y="165" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">D4</text>

              {/* Bottom row boxes */}
              <rect x="75" y="195" width="55" height="38" rx="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
              <text x="102" y="218" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="bold">E5</text>

              <rect x="145" y="200" width="45" height="33" rx="6" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <text x="167" y="221" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10" fontWeight="bold">F6</text>

              {/* Floating checkmark badge */}
              <circle cx="320" cy="90" r="30" fill="rgba(16,185,129,0.8)" className="animate-pulse"/>
              <path d="M308 90l8 8 16-16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

              {/* Arrow coming in */}
              <path d="M30 80 L30 160 L55 160" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="6 4" fill="none"/>
              <polygon points="55,155 65,160 55,165" fill="rgba(255,255,255,0.5)"/>
              <text x="30" y="70" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="500">IN</text>
            </svg>
          </div>

          {/* Tagline */}
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Kelola Stok Barang<br/>Lebih Mudah & Cepat
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-md">
            Pantau stok masuk, stok keluar, dan laporan inventori dalam satu dashboard yang simpel.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { icon: Shield, text: 'Aman & Privat' },
              { icon: BarChart3, text: 'Laporan Real-time' },
              { icon: Zap, text: 'Cepat & Ringan' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <f.icon className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold">StockFlow</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Sistem Manajemen Inventori</p>
          </div>

          {/* Form card */}
          <div className="bg-card rounded-2xl border border-border shadow-lg shadow-black/5 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Selamat Datang</h2>
              <p className="text-sm text-muted-foreground mt-1">Masuk ke akun StockFlow kamu</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-slide-down flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <label className={`absolute left-4 transition-all duration-200 pointer-events-none
                  ${emailFocused || email ? 'top-2 text-xs text-primary font-medium' : 'top-3.5 text-sm text-muted-foreground'}`}>
                  Email
                </label>
              </div>

              {/* Password field */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  required
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all pr-12"
                />
                <label className={`absolute left-4 transition-all duration-200 pointer-events-none
                  ${passFocused || password ? 'top-2 text-xs text-primary font-medium' : 'top-3.5 text-sm text-muted-foreground'}`}>
                  Password
                </label>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-ring accent-primary cursor-pointer" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Ingat saya</span>
                </label>
              </div>

              {/* Submit button */}
              <button
                ref={btnRef}
                type="submit"
                disabled={loading}
                className="relative w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100 overflow-hidden group"
              >
                <span className={`flex items-center justify-center gap-2 transition-all ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Masuk
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </button>
            </form>
          </div>


        </div>
      </div>
    </div>
  )
}
