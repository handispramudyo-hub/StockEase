import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import api from '@/api/client'
import { Eye, EyeOff, Loader2, Package, ArrowRight, Shield, BarChart3, Zap, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const user = res.data
      if (user && user.status === 'aktif') { login(user); navigate('/dashboard') }
      else setError('Akun tidak aktif')
    } catch { setError('Email atau password salah') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">

      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]" />

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg w-full">
          {/* Logo */}
          <div className={`flex items-center gap-3 mb-12 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">StockFlow</span>
          </div>

          {/* Hero illustration */}
          <div className={`relative mb-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8">
              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-[60px]" />

              <svg viewBox="0 0 400 260" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="boxGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(139,92,246,0.4)" />
                    <stop offset="100%" stopColor="rgba(139,92,246,0.15)" />
                  </linearGradient>
                  <linearGradient id="boxGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(6,182,212,0.4)" />
                    <stop offset="100%" stopColor="rgba(6,182,212,0.15)" />
                  </linearGradient>
                  <linearGradient id="boxGrad3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(251,191,36,0.4)" />
                    <stop offset="100%" stopColor="rgba(251,191,36,0.15)" />
                  </linearGradient>
                </defs>

                {/* Shelf structure */}
                <rect x="40" y="110" width="320" height="140" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                <line x1="40" y1="170" x2="360" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                <line x1="40" y1="220" x2="360" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

                {/* Dividers */}
                <line x1="160" y1="110" x2="160" y2="250" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
                <line x1="280" y1="110" x2="280" y2="250" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

                {/* Row 1 boxes */}
                <rect x="55" y="125" width="90" height="35" rx="8" fill="url(#boxGrad1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
                <text x="100" y="148" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12" fontWeight="600">Elektronik</text>

                <rect x="175" y="120" width="90" height="40" rx="8" fill="url(#boxGrad2)" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" />
                <text x="220" y="146" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12" fontWeight="600">ATK</text>

                <rect x="295" y="128" width="50" height="32" rx="8" fill="url(#boxGrad3)" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5" />
                <text x="320" y="149" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="600">Lain</text>

                {/* Row 2 boxes */}
                <rect x="65" y="180" width="80" height="32" rx="8" fill="url(#boxGrad2)" stroke="rgba(6,182,212,0.25)" strokeWidth="1.5" />
                <text x="105" y="200" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="600">Buku Tulis</text>

                <rect x="175" y="182" width="90" height="30" rx="8" fill="url(#boxGrad1)" stroke="rgba(139,92,246,0.25)" strokeWidth="1.5" />
                <text x="220" y="201" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="600">Kabel HDMI</text>

                <rect x="295" y="175" width="55" height="37" rx="8" fill="url(#boxGrad3)" stroke="rgba(251,191,36,0.25)" strokeWidth="1.5" />
                <text x="322" y="198" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="600">Meja</text>

                {/* Top checkmark badge */}
                <circle cx="340" cy="75" r="28" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.4)" strokeWidth="2" />
                <circle cx="340" cy="75" r="14" fill="rgba(34,197,94,0.3)" />
                <path d="M333 75l5 5 9-9" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* API/badge label */}
                <rect x="60" y="60" width="70" height="24" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="95" y="76" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="500">v2.1.0</text>

                {/* Incoming arrow */}
                <path d="M25 70 L25 140 L45 140" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
                <polygon points="45,135 52,140 45,145" fill="rgba(255,255,255,0.3)" />
              </svg>

              {/* Stats overlay */}
              <div className="absolute bottom-6 right-8 flex gap-4">
                <div className="bg-white/[0.06] rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/[0.06]">
                  <p className="text-xs text-white/40 font-medium">Total Barang</p>
                  <p className="text-lg font-bold text-white">1,248</p>
                </div>
                <div className="bg-white/[0.06] rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/[0.06]">
                  <p className="text-xs text-white/40 font-medium">Stok Hari Ini</p>
                  <p className="text-lg font-bold text-white">+56</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Kelola Stok<br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 text-transparent bg-clip-text">Tanpa Ribet</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-md">
              Pantau stok masuk, keluar, dan laporan dalam satu dashboard yang simpel dan cepat.
            </p>
          </div>

          {/* Feature badges */}
          <div className={`flex flex-wrap gap-3 mt-8 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { icon: Shield, text: 'Aman & Privat' },
              { icon: BarChart3, text: 'Laporan Real-time' },
              { icon: Zap, text: 'Cepat & Ringan' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/[0.06] hover:bg-white/[0.1] transition-colors">
                <f.icon className="w-3.5 h-3.5 text-white/50" />
                <span className="text-sm text-white/60 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Mobile branding */}
        <div className={`lg:hidden absolute top-6 left-0 right-0 text-center transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl shadow-lg shadow-violet-500/30 mb-2">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white">StockFlow</h1>
          <p className="text-sm text-white/40">Sistem Manajemen Inventori</p>
        </div>

        {/* Form card */}
        <div className={`w-full max-w-sm relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-transparent to-cyan-500/20 rounded-3xl blur-xl" />

            <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="mb-7 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.06] rounded-full text-xs text-white/50 mb-4">
                  <Sparkles className="w-3 h-3" />
                  Platform Inventory
                </div>
                <h2 className="text-xl font-bold text-white">Selamat Datang</h2>
                <p className="text-sm text-white/40 mt-1">Masuk untuk mengelola stok</p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-2.5 animate-slide-down">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                    placeholder=" "
                    className="peer w-full px-4 pt-6 pb-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white placeholder-transparent focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                  />
                  <label className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${emailFocused || email
                      ? 'top-2 text-[10px] text-violet-400 font-medium'
                      : 'top-3.5 text-sm text-white/30'}`}>
                    Email
                  </label>
                  <div className="absolute inset-0 rounded-2xl border border-white/0 group-focus-within:border-violet-500/30 transition-all pointer-events-none" />
                </div>

                {/* Password */}
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    required
                    placeholder=" "
                    className="peer w-full px-4 pt-6 pb-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white placeholder-transparent focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all pr-12"
                  />
                  <label className={`absolute left-4 transition-all duration-200 pointer-events-none
                    ${passFocused || password
                      ? 'top-2 text-[10px] text-violet-400 font-medium'
                      : 'top-3.5 text-sm text-white/30'}`}>
                    Password
                  </label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white/60 rounded-xl hover:bg-white/[0.06] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl border border-white/0 group-focus-within:border-violet-500/30 transition-all pointer-events-none" />
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-4 h-4 rounded-md border border-white/[0.12] bg-white/[0.04] peer-checked:bg-violet-500 peer-checked:border-violet-500 transition-all" />
                      <svg className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/30 group-hover:text-white/50 transition-colors">Ingat saya</span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl text-sm font-semibold hover:from-violet-500 hover:to-blue-500 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100 overflow-hidden group shadow-lg shadow-violet-500/20"
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

              {/* Footer */}
              <p className="text-center text-xs text-white/20 mt-6">
                StockFlow &copy; {new Date().getFullYear()} &mdash; Manajemen Inventori
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
