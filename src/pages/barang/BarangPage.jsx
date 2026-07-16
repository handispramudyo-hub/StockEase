import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import toast from 'react-hot-toast'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PageHeader from '@/components/common/PageHeader'
import { Plus, Edit, Trash2, Package, Eye, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import PDFPreviewModal from '@/components/common/PDFPreviewModal'

export default function BarangPage() {
  const [data, setData] = useState([])
  const [kategoriList, setKategoriList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [showPDF, setShowPDF] = useState(false)
  const [form, setForm] = useState({})

  const defaultForm = { nama: '', kategori_id: '', stok: '', stok_minimum: 10, satuan: 'PCS', status: 'aktif' }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [b, k] = await Promise.all([api.get('/barang'), api.get('/kategori')])
      setData(b.data); setKategoriList(k.data)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const kMap = useMemo(() => Object.fromEntries(kategoriList.map(k => [k.id, k])), [kategoriList])

  const filtered = data.filter(b => {
    const matchSearch = b.nama.toLowerCase().includes(search.toLowerCase())
    const matchKategori = !filterKategori || b.kategori_id === Number(filterKategori)
    return matchSearch && matchKategori
  })

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true) }
  const openEdit = (item) => { setEditItem(item); setForm({ ...item, kategori_id: item.kategori_id }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama?.trim()) return toast.error('Nama barang wajib diisi')
    try {
      const payload = { ...form, stok_minimum: Number(form.stok_minimum), kategori_id: Number(form.kategori_id) }
      if (editItem) { delete payload.stok; await api.put(`/barang/${editItem.id}`, { ...editItem, ...payload }); toast.success('Barang berhasil diupdate') }
      else { payload.stok = Number(form.stok || 0); await api.post('/barang', { ...payload, created_at: new Date().toISOString() }); toast.success('Barang berhasil ditambahkan') }
      setShowModal(false); fetchData()
    } catch { toast.error('Gagal menyimpan data') }
  }

  const handleDelete = async () => {
    try { await api.delete(`/barang/${showDelete}`); toast.success('Barang berhasil dihapus'); setShowDelete(null); fetchData() }
    catch { toast.error('Gagal menghapus data') }
  }

  const stokBadge = (b) => {
    if (b.stok === 0) return 'bg-red-100 text-red-700 border-red-200'
    if (b.stok <= b.stok_minimum) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const columns = [
    { header: 'No', accessor: (_, i) => i + 1, width: '50px' },
    { header: 'Nama Barang', accessor: (row) => <div className="flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground" />{row.nama}</div> },
    { header: 'Kategori', accessor: (row) => kMap[row.kategori_id]?.nama || '-' },
    { header: 'Stok', accessor: (row) => <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", stokBadge(row))}>{row.stok} {row.satuan}</span> },
    { header: 'Status', accessor: (row) => <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", row.status === 'aktif' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>{row.status}</span> },
    { header: 'Aksi', accessor: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setShowDetail(row)} className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg"><Eye className="w-4 h-4" /></button>
        <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
        <button onClick={() => setShowDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>
    ), width: '120px' },
  ]

  const inputCls = "w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
  const selectCls = "w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <div className="space-y-6">
      <PageHeader title="Barang" subtitle="Kelola data barang" actions={
        <div className="flex gap-2">
          <button onClick={() => setShowPDF(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"><Printer className="w-4 h-4" /> Cetak PDF</button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4" /> Tambah Barang</button>
        </div>
      } />
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Cari nama barang..." value={search} onChange={e => setSearch(e.target.value)} className={cn(inputCls, "max-w-sm")} />
          <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className={cn(selectCls, "max-w-[200px]")}>
            <option value="">Semua Kategori</option>
            {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} searchable={false} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Barang' : 'Tambah Barang'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Nama Barang *</label><input type="text" value={form.nama || ''} onChange={e => setForm({...form, nama: e.target.value})} className={inputCls} required /></div>
            <div><label className="block text-sm font-medium mb-1">Kategori</label><select value={form.kategori_id || ''} onChange={e => setForm({...form, kategori_id: e.target.value})} className={selectCls}><option value="">Pilih</option>{kategoriList.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Satuan</label><select value={form.satuan || 'PCS'} onChange={e => setForm({...form, satuan: e.target.value})} className={selectCls}>{['PCS','BOX','PACK','UNIT','KG','LITER','METER','DUS','BOTOL','KARUNG'].map(s=><option key={s}>{s}</option>)}</select></div>
            {!editItem && <div><label className="block text-sm font-medium mb-1">Stok Awal</label><input type="number" value={form.stok || ''} onChange={e => setForm({...form, stok: e.target.value})} className={inputCls} /></div>}
            <div><label className="block text-sm font-medium mb-1">Stok Minimum</label><input type="number" value={form.stok_minimum || ''} onChange={e => setForm({...form, stok_minimum: e.target.value})} className={inputCls} /></div>
            <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status || 'aktif'} onChange={e => setForm({...form, status: e.target.value})} className={selectCls}><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Simpan</button>
          </div>
        </form>
      </Modal>

      {showDetail && (
        <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Detail Barang" size="md">
          <div className="space-y-3">
            {[
              ['Nama', showDetail.nama],
              ['Kategori', kMap[showDetail.kategori_id]?.nama],
              ['Stok', `${showDetail.stok} ${showDetail.satuan}`],
              ['Stok Minimum', showDetail.stok_minimum],
              ['Status', showDetail.status],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-border last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{val || '-'}</span></div>
            ))}
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} title="Hapus Barang" message="Barang yang dihapus tidak dapat dikembalikan." variant="danger" />

      {showPDF && (
        <PDFPreviewModal
          isOpen={showPDF}
          onClose={() => setShowPDF(false)}
          title="Data Barang"
          filename="laporan-barang"
          columns={[
            { header: 'No', accessor: (_, i) => i + 1 },
            { header: 'Nama', accessor: 'nama' },
            { header: 'Kategori', accessor: (row) => kMap[row.kategori_id]?.nama || '-' },
            { header: 'Stok', accessor: (row) => `${row.stok} ${row.satuan}` },
            { header: 'Status', accessor: (row) => row.status },
          ]}
          data={filtered}
        />
      )}
    </div>
  )
}
