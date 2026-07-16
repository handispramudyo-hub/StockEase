import { useState, useEffect } from 'react'
import api from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import { Package, AlertTriangle, XCircle, TrendingUp, TrendingDown, ShoppingCart, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [brg, kat, sm, sk, akt, notif] = await Promise.all([
          api.get('/barang'), api.get('/kategori'), api.get('/stok_masuk'), api.get('/stok_keluar'),
          api.get('/aktivitas'), api.get('/notifikasi'),
        ])
        const all = brg.data
        const hh = all.filter(b => b.stok > 0 && b.stok <= b.stok_minimum).length
        const hb = all.filter(b => b.stok === 0).length
        const totalNilaiBarang = all.reduce((s, b) => s + (b.harga_jual || 0) * (b.stok || 0), 0)

        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const smHari = sm.data.filter(s => s.tanggal === today)
        const skHari = sk.data.filter(s => s.tanggal === today)
        const stokMasukHariIni = smHari.reduce((s, p) => s + p.qty, 0)
        const stokKeluarHariIni = skHari.reduce((s, p) => s + p.qty, 0)

        const monthly = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const m = d.toLocaleString('id-ID', { month: 'short' })
          const ms = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
          const masuk = sm.data.filter(s => s.tanggal.startsWith(ms)).reduce((s,p) => s+p.qty, 0)
          const keluar = sk.data.filter(s => s.tanggal.startsWith(ms)).reduce((s,p) => s+p.qty, 0)
          monthly.push({ name: m, Masuk: masuk, Keluar: keluar })
        }

        const distK = kat.data.map(k => ({ name: k.nama, value: all.filter(b => b.kategori_id === k.id).length, color: k.warna })).filter(d => d.value > 0)
        const stokS = [
          { name: 'Normal', value: all.filter(b => b.stok > b.stok_minimum).length },
          { name: 'Menipis', value: hh },
          { name: 'Habis', value: hb },
        ].filter(d => d.value > 0)
        const topB = [...all].sort((a,b) => b.stok - a.stok).slice(0,5).map(b => ({ name: b.nama.length > 15 ? b.nama.slice(0,15)+'...' : b.nama, stok: b.stok }))

        setStats({
          totalBarang: all.length, hampirHabis: hh, habis: hb, totalNilaiBarang,
          stokMasukHariIni, stokKeluarHariIni, stokMasukBulanan: monthly,
          distKategori: distK, statusStok: stokS, topBarang: topB,
          aktivitas: akt.data.slice(0, 5), notifikasi: notif.data,
        })
      } catch(e) { console.error(e) } finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  const cards = [
    { label: 'Total Barang', value: stats.totalBarang, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Nilai Stok', value: formatCurrency(stats.totalNilaiBarang), icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Stok Masuk Hari Ini', value: stats.stokMasukHariIni, icon: ArrowDownToLine, color: 'bg-green-500' },
    { label: 'Stok Keluar Hari Ini', value: stats.stokKeluarHariIni, icon: ArrowUpFromLine, color: 'bg-orange-500' },
    { label: 'Stok Menipis', value: stats.hampirHabis, icon: AlertTriangle, color: 'bg-amber-500' },
    { label: 'Stok Habis', value: stats.habis, icon: XCircle, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-muted-foreground text-sm">Ringkasan data inventori</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">{c.label}</p><p className="text-2xl font-bold mt-1">{c.value}</p></div>
              <div className={`${c.color} p-3 rounded-xl`}><c.icon className="w-5 h-5 text-white" /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Stok Masuk vs Keluar (6 Bulan)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.stokMasukBulanan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Masuk" fill="#10B981" radius={[4,4,0,0]} />
              <Bar dataKey="Keluar" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Distribusi Kategori</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.distKategori} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({name,value})=>`${name} (${value})`}>
                {stats.distKategori.map((e,i)=><Cell key={i} fill={e.color||COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Status Stok</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.statusStok} cx="50%" cy="50%" innerRadius={80} outerRadius={110} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                <Cell fill="#10B981" /><Cell fill="#F59E0B" /><Cell fill="#EF4444" />
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Barang Terbanyak (per Stok)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.topBarang}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="stok" fill="#8B5CF6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {stats.notifikasi.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3">Notifikasi Stok</h3>
          <div className="space-y-2">
            {stats.notifikasi.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{n.judul}</p>
                  <p className="text-xs text-muted-foreground">{n.pesan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {stats.aktivitas.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3">Aktivitas Terbaru</h3>
          <div className="space-y-2">
            {stats.aktivitas.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm">{a.aktivitas}</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.waktu).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
