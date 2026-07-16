import { useState, useEffect } from 'react'
import api from '@/api/client'
import toast from 'react-hot-toast'
import PageHeader from '@/components/common/PageHeader'
import { Save, Building2, Info } from 'lucide-react'

const DEFAULT_FORM = { nama_aplikasi: '', nama_perusahaan: '', alamat: '', telepon: '', email: '', website: '', footer: '' }

export default function SettingsPage() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const r = await api.get('/settings/1')
      setForm({ ...DEFAULT_FORM, ...r.data })
    } catch { toast.error('Gagal memuat pengaturan') } finally { setLoading(false) }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.patch('/settings/1', form)
      toast.success('Pengaturan berhasil disimpan')
    } catch { toast.error('Gagal menyimpan pengaturan') } finally { setSaving(false) }
  }

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" subtitle="Atur profil toko dan aplikasi" />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Profil Toko</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Nama Aplikasi</label>
                <input type="text" value={form.nama_aplikasi} onChange={e => handleChange('nama_aplikasi', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-1">Nama Perusahaan</label>
                <input type="text" value={form.nama_perusahaan} onChange={e => handleChange('nama_perusahaan', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Alamat</label>
              <textarea value={form.alamat} onChange={e => handleChange('alamat', e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Telepon</label>
                <input type="text" value={form.telepon} onChange={e => handleChange('telepon', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Website</label>
              <input type="text" value={form.website} onChange={e => handleChange('website', e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <div><label className="block text-sm font-medium mb-1">Footer</label>
              <textarea value={form.footer} onChange={e => handleChange('footer', e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Tentang Aplikasi</h2>
          </div>
          <div className="p-6 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between"><span>Nama Aplikasi</span><span className="font-medium text-foreground">{form.nama_aplikasi || '-'}</span></div>
            <div className="flex items-center justify-between"><span>Perusahaan</span><span className="font-medium text-foreground">{form.nama_perusahaan || '-'}</span></div>
            <div className="flex items-center justify-between"><span>Versi</span><span className="font-medium text-foreground">v1.0.0</span></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  )
}
