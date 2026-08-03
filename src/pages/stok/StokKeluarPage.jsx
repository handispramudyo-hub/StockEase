import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '@/api/client'
import toast from 'react-hot-toast'
import useUiStore from '@/store/uiStore'
import DataTable from '@/components/common/DataTable'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PageHeader from '@/components/common/PageHeader'
import { Plus, Edit, Trash2, ArrowUpFromLine, Search, X, Check } from 'lucide-react'

export default function StokKeluarPage() {
  const triggerNotifRefresh = useUiStore(s => s.triggerNotifRefresh)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [barangs, setBarangs] = useState([])
  const [form, setForm] = useState({ barang_id: '', qty: 1, tanggal: new Date().toISOString().slice(0, 10), keterangan: '', tujuan: '' })
  const [selected, setSelected] = useState([])
  const [searchBarang, setSearchBarang] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [sk, brg] = await Promise.all([api.get('/stok_keluar'), api.get('/barang')])
      setData(sk.data)
      setBarangs(brg.data)
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const barangFiltered = useMemo(() => {
    if (!searchBarang) return barangs
    const q = searchBarang.toLowerCase()
    return barangs.filter(b => b.nama.toLowerCase().includes(q) || String(b.id).includes(q))
  }, [barangs, searchBarang])

  const openAdd = () => {
    setEditItem(null)
    setForm({ barang_id: '', qty: 1, tanggal: new Date().toISOString().slice(0, 10), keterangan: '', tujuan: '' })
    setSearchBarang('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      barang_id: String(item.barang_id),
      qty: item.qty,
      tanggal: item.tanggal,
      keterangan: item.keterangan || '',
      tujuan: item.tujuan || '',
    })
    const brg = barangs.find(b => String(b.id) === String(item.barang_id))
    setSearchBarang(brg?.nama || '')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.barang_id) return toast.error('Barang wajib dipilih')
    if (!form.qty || form.qty <= 0) return toast.error('Qty harus lebih dari 0')
    if (!form.tujuan) return toast.error('Ke / Tujuan wajib diisi')

    setSaving(true)
    try {
      if (editItem) {
        const oldQty = Number(editItem.qty)
        const newQty = Number(form.qty)
        const newBarangId = form.barang_id

        if (String(editItem.barang_id) !== String(newBarangId)) {
          const oldBrg = barangs.find(b => String(b.id) === String(editItem.barang_id))
          const newBrg = barangs.find(b => String(b.id) === String(newBarangId))
          if (oldBrg) await api.patch(`/barang/${editItem.barang_id}`, { stok: (oldBrg.stok || 0) + oldQty })
          if (newBrg) {
            if (newBrg.stok < newQty) { setSaving(false); return toast.error(`Stok ${newBrg.nama} tidak cukup (tersedia: ${newBrg.stok})`) }
            await api.patch(`/barang/${newBarangId}`, { stok: (newBrg.stok || 0) - newQty })
          }
        } else {
          const brg = barangs.find(b => String(b.id) === String(editItem.barang_id))
          const diff = newQty - oldQty
          if (brg) {
            if (diff > 0 && brg.stok < diff) { setSaving(false); return toast.error(`Stok ${brg.nama} tidak cukup (tersedia: ${brg.stok})`) }
            await api.patch(`/barang/${editItem.barang_id}`, { stok: (brg.stok || 0) - diff })
          }
        }

        await api.put(`/stok_keluar/${editItem.id}`, { barang_id: Number(form.barang_id), qty: Number(form.qty), tanggal: form.tanggal, keterangan: form.keterangan, tujuan: form.tujuan })
        toast.success('Stok keluar berhasil diupdate')
      } else {
        const brg = barangs.find(b => String(b.id) === String(form.barang_id))
        if (brg && brg.stok < Number(form.qty)) {
          setSaving(false)
          return toast.error(`Stok ${brg.nama} tidak cukup (tersedia: ${brg.stok})`)
        }

        await api.post('/stok_keluar', form)
        if (brg) {
          await api.patch(`/barang/${form.barang_id}`, { stok: (brg.stok || 0) - Number(form.qty) })
        }
        toast.success('Stok keluar berhasil disimpan')
      }
      setShowModal(false)
      setEditItem(null)
      fetchData()
      triggerNotifRefresh()
    } catch {
      toast.error('Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/stok_keluar/${showDelete}`)
      toast.success('Stok keluar berhasil dihapus')
      setShowDelete(null)
      fetchData()
      triggerNotifRefresh()
    } catch {
      toast.error('Gagal menghapus data')
    }
  }

  const handleBulkDelete = async () => {
    try {
      await api.post('/stok_keluar/bulk-delete', { ids: selected })
      toast.success(`${selected.length} stok keluar berhasil dihapus`)
      setSelected([])
      setShowBulkDelete(false)
      fetchData()
      triggerNotifRefresh()
    } catch {
      toast.error('Gagal menghapus data')
    }
  }

  const selectAll = () => {
    if (selected.length === data.length) setSelected([])
    else setSelected(data.map(d => d.id))
  }

  const toggleSelect = (id) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const getBarangName = (id) => barangs.find(b => String(b.id) === String(id))?.nama || '-'
  const getBarangSatuan = (id) => barangs.find(b => String(b.id) === String(id))?.satuan || '-'

  const columns = [
    { header: (
      <input type="checkbox" checked={selected.length === data.length && data.length > 0}
        onChange={selectAll} className="w-4 h-4 rounded border-border accent-primary" />
    ), accessor: (row) => (
      <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)}
        className="w-4 h-4 rounded border-border accent-primary" />
    ), width: '40px' },
    { header: 'No', accessor: (_, i) => i + 1, width: '40px' },
    { header: 'Tanggal', accessor: (row) => formatDate(row.tanggal) },
    { header: 'Barang', accessor: (row) => getBarangName(row.barang_id) },
    { header: 'Ke / Tujuan', accessor: (row) => row.tujuan || '-' },
    { header: 'Qty', accessor: (row) => row.qty },
    { header: 'Satuan', accessor: (row) => getBarangSatuan(row.barang_id) },
    { header: 'Keterangan', accessor: (row) => row.keterangan || '-' },
    { header: 'Aksi', accessor: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => setShowDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ), width: '80px' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Stok Keluar" subtitle="Catat stok keluar (rusak/hilang)" actions={
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={() => setShowBulkDelete(true)} className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90">
              <Trash2 className="w-4 h-4" /> Hapus ({selected.length})
            </button>
          )}
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
            <ArrowUpFromLine className="w-4 h-4" /> Tambah Stok Keluar
          </button>
        </div>
      } />

      <div className="bg-card rounded-xl border border-border">
        <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Cari stok keluar..." />
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null) }} title={editItem ? 'Edit Stok Keluar' : 'Tambah Stok Keluar'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Barang *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchBarang} onChange={e => { setSearchBarang(e.target.value); setForm({ ...form, barang_id: '' }) }}
                className="w-full pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Cari barang..." />
              {searchBarang && <button type="button" onClick={() => { setSearchBarang(''); setForm({ ...form, barang_id: '' }) }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
            <div className="mt-1 max-h-40 overflow-y-auto border border-input rounded-lg">
              {barangFiltered.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground text-center">Barang tidak ditemukan</p>
              ) : barangFiltered.map(b => (
                <button key={b.id} type="button" onClick={() => { setForm({ ...form, barang_id: String(b.id) }); setSearchBarang(b.nama) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${String(form.barang_id) === String(b.id) ? 'bg-primary/10 font-medium' : ''}`}>
                  {String(form.barang_id) === String(b.id) && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  <span className="flex-1 truncate">{b.nama}</span>
                  <span className="text-xs text-muted-foreground shrink-0">Stok: {b.stok}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ke / Tujuan *</label>
            <input type="text" value={form.tujuan} onChange={e => setForm({ ...form, tujuan: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Contoh: PT. Maju Jaya" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Qty *</label>
              <input type="number" value={form.qty} min="1" onChange={e => setForm({ ...form, qty: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal *</label>
              <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <input type="text" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Rusak, hilang, dll." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditItem(null) }} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Batal</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete}
        title="Hapus Stok Keluar" message="Stok barang akan ditambah sesuai qty yang dihapus. Yakin?" variant="danger" />

      <ConfirmDialog isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} onConfirm={handleBulkDelete}
        title="Hapus Stok Keluar Terpilih" message={`${selected.length} data stok keluar akan dihapus dan stok barang akan disesuaikan. Yakin?`} variant="danger" />
    </div>
  )
}