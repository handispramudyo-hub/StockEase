import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import api from '@/api/client'
import { Eye, EyeOff, Loader2, Package, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const user = res.data
      if (user && user.status === 'aktif') { login(user); navigate('/dashboard') }
      else setError('Akun tidak aktif')
    } catch {
      setError('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-slate-950 flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">StockFlow</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            Kelola Stok Tanpa Ribet
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Pantau stok masuk, keluar, dan laporan dalam satu dashboard yang simpel dan cepat.
          </p>
        </div>

        <p className="text-sm text-slate-600">
          StockFlow &copy; {new Date().getFullYear()} &mdash; Manajemen Inventori
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">StockFlow</h1>
            <p className="text-sm text-muted-foreground">Sistem Manajemen Inventori</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-card-foreground">Masuk</h2>
              <p className="text-sm text-muted-foreground mt-1">Silakan masuk menggunakan akun Anda</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 bg-background border border-input rounded-lg text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-border accent-primary" />
                <span className="text-sm text-muted-foreground">Ingat saya</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6 lg:hidden">
              StockFlow &copy; {new Date().getFullYear()} &mdash; Manajemen Inventori
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
