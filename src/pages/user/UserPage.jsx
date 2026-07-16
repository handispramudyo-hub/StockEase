import { useState, useEffect } from 'react'
import api from '@/api/client'
import toast from 'react-hot-toast'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PageHeader from '@/components/common/PageHeader'
import { Plus, Edit, Trash2 } from 'lucide-react'

const ROLE_STYLES = {
  admin: 'bg-blue-100 text-blue-700',
  staff_gudang: 'bg-green-100 text-green-700',
  staff_penjualan: 'bg-purple-100 text-purple-700',
  owner: 'bg-amber-100 text-amber-700',
}

const ROLE_LABELS = {
  admin: 'Admin',
  staff_gudang: 'Staff Gudang',
  staff_penjualan: 'Staff Penjualan',
  owner: 'Owner',
}

export default function UserPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'staff_gudang', status: 'aktif' })

  const fetchData = async () => { try { setLoading(true); const r = await api.get('/users'); setData(r.data) } catch { toast.error('Gagal memuat data') } finally { setLoading(false) } }
  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditItem(null); setForm({ nama: '', email: '', password: '', role: 'staff_gudang', status: 'aktif' }); setShowModal(true) }
  const openEdit = (item) => { setEditItem(item); setForm({ nama: item.nama, email: item.email, password: '', role: item.role, status: item.status }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama.trim()) return toast.error('Nama wajib diisi')
    if (!form.email.trim()) return toast.error('Email wajib diisi')
    if (!editItem && !form.password.trim()) return toast.error('Password wajib diisi')
    try {
      if (editItem) {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.put(`/users/${editItem.id}`, payload); toast.success('User berhasil diupdate')
      } else {
        await api.post('/users', form); toast.success('User berhasil ditambahkan')
      }
      setShowModal(false); fetchData()
    } catch { toast.error('Gagal menyimpan data') }
  }

  const handleDelete = async () => {
    try { await api.delete(`/users/${showDelete}`); toast.success('User berhasil dihapus'); setShowDelete(null); fetchData() }
    catch { toast.error('Gagal menghapus data') }
  }

  const columns = [
    { header: 'No', accessor: (_, i) => i + 1, width: '60px' },
    { header: 'Nama', accessor: 'nama' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: (row) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[row.role] || 'bg-gray-100 text-gray-700'}`}>
        {ROLE_LABELS[row.role] || row.role}
      </span>
    )},
    { header: 'Status', accessor: (row) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {row.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
      </span>
    )},
    { header: 'Aksi', accessor: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
        <button onClick={() => setShowDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    ), width: '100px' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="User" subtitle="Kelola data pengguna" actions={
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4" /> Tambah User</button>
      } />
      <div className="bg-card rounded-xl border border-border"><DataTable columns={columns} data={data} loading={loading} /></div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit User' : 'Tambah User'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nama *</label>
            <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" required /></div>
          <div><label className="block text-sm font-medium mb-1">{editItem ? 'Password (kosongkan jika tidak ubah)' : 'Password *'}</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...(!editItem ? { required: true } : {})} /></div>
          <div><label className="block text-sm font-medium mb-1">Role *</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="admin">Admin</option>
              <option value="staff_gudang">Staff Gudang</option>
              <option value="staff_penjualan">Staff Penjualan</option>
              <option value="owner">Owner</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Status *</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Simpan</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} title="Hapus User" message="User yang dihapus tidak dapat dikembalikan." variant="danger" />
    </div>
  )
}
