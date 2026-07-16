import { useState, useEffect } from 'react'
import api from '@/api/client'
import toast from 'react-hot-toast'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PageHeader from '@/components/common/PageHeader'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function KategoriPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({ nama: '', warna: '#3B82F6' })

  const fetchData = async () => { try { setLoading(true); const r = await api.get('/kategori'); setData(r.data) } catch { toast.error('Gagal memuat data') } finally { setLoading(false) } }
  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditItem(null); setForm({ nama: '', warna: '#3B82F6' }); setShowModal(true) }
  const openEdit = (item) => { setEditItem(item); setForm({ nama: item.nama, warna: item.warna }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama.trim()) return toast.error('Nama kategori wajib diisi')
    try {
      if (editItem) { await api.put(`/kategori/${editItem.id}`, { ...editItem, ...form }); toast.success('Kategori berhasil diupdate') }
      else { await api.post('/kategori', form); toast.success('Kategori berhasil ditambahkan') }
      setShowModal(false); fetchData()
    } catch { toast.error('Gagal menyimpan data') }
  }

  const handleDelete = async () => {
    try { await api.delete(`/kategori/${showDelete}`); toast.success('Kategori berhasil dihapus'); setShowDelete(null); fetchData() }
    catch { toast.error('Gagal menghapus data') }
  }

  const columns = [
    { header: 'No', accessor: (_, i) => i + 1, width: '60px' },
    { header: 'Nama Kategori', accessor: (row) => <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: row.warna}} />{row.nama}</div> },
    { header: 'Warna', accessor: (row) => <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{backgroundColor: row.warna}}>{row.warna}</span> },
    { header: 'Aksi', accessor: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
        <button onClick={() => setShowDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    ), width: '100px' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Kategori" subtitle="Kelola kategori barang" actions={
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4" /> Tambah Kategori</button>
      } />
      <div className="bg-card rounded-xl border border-border"><DataTable columns={columns} data={data} loading={loading} /></div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Kategori' : 'Tambah Kategori'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nama Kategori *</label>
            <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" required /></div>
          <div><label className="block text-sm font-medium mb-1">Warna</label>
            <input type="color" value={form.warna} onChange={e => setForm({...form, warna: e.target.value})} className="w-full h-10 px-1 py-1 bg-background border border-input rounded-lg cursor-pointer" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Simpan</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} title="Hapus Kategori" message="Kategori yang dihapus tidak dapat dikembalikan." variant="danger" />
    </div>
  )
}
