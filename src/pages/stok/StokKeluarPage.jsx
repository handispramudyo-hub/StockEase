import { useState, useEffect, useCallback } from 'react'
import api from '@/api/client'
import toast from 'react-hot-toast'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PageHeader from '@/components/common/PageHeader'
import { Plus, Edit, Trash2, ArrowUpFromLine } from 'lucide-react'

export default function StokKeluarPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [barangs, setBarangs] = useState([])
  const [form, setForm] = useState({ barang_id: '', qty: 1, tanggal: new Date().toISOString().split('T')[0], keterangan: '', tujuan: '' })

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

  const openAdd = () => {
    setEditItem(null)
    setForm({ barang_id: '', qty: 1, tanggal: new Date().toISOString().split('T')[0], keterangan: '', tujuan: '' })
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

        await api.put(`/stok_keluar/${editItem.id}`, { ...editItem, ...form, barang_id: Number(form.barang_id), qty: Number(form.qty) })
        const brg = barangs.find(b => String(b.id) === String(newBarangId))
        await api.post('/aktivitas', {
          aktivitas: `Update stok keluar: ${brg?.nama || ''} qty ${oldQty} → ${newQty} ke ${form.tujuan}`,
          tanggal: form.tanggal,
        })
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
        await api.post('/aktivitas', {
          aktivitas: `Stok keluar: ${brg?.nama || ''} -${form.qty} ke ${form.tujuan} (${form.keterangan || 'Tanpa keterangan'})`,
          tanggal: form.tanggal,
        })
        toast.success('Stok keluar berhasil disimpan')
      }
      setShowModal(false)
      setEditItem(null)
      fetchData()
    } catch {
      toast.error('Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const item = data.find(d => d.id === showDelete)
      if (item) {
        const brg = barangs.find(b => String(b.id) === String(item.barang_id))
        if (brg) await api.patch(`/barang/${item.barang_id}`, { stok: (brg.stok || 0) + item.qty })
      }
      await api.delete(`/stok_keluar/${showDelete}`)
      toast.success('Stok keluar berhasil dihapus')
      setShowDelete(null)
      fetchData()
    } catch {
      toast.error('Gagal menghapus data')
    }
  }

  const getBarangName = (id) => barangs.find(b => String(b.id) === String(id))?.nama || '-'
  const getBarangSatuan = (id) => barangs.find(b => String(b.id) === String(id))?.satuan || '-'

  const columns = [
    { header: 'No', accessor: (_, i) => i + 1, width: '50px' },
    { header: 'Tanggal', accessor: 'tanggal' },
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
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <ArrowUpFromLine className="w-4 h-4" /> Tambah Stok Keluar
        </button>
      } />

      <div className="bg-card rounded-xl border border-border">
        <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Cari stok keluar..." />
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null) }} title={editItem ? 'Edit Stok Keluar' : 'Tambah Stok Keluar'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Barang *</label>
            <select value={form.barang_id} onChange={e => setForm({ ...form, barang_id: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" required>
              <option value="">-- Pilih Barang --</option>
              {barangs.map(b => <option key={b.id} value={b.id}>{b.nama} (Stok: {b.stok})</option>)}
            </select>
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
        title="Hapus Stok Keluar" message="Stok barang akan ditambahkan kembali sesuai qty. Yakin?" variant="danger" />
    </div>
  )
}
