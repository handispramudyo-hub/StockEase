import { useState, useEffect, useMemo, useRef } from 'react'
import api from '@/api/client'
import toast from 'react-hot-toast'
import useUiStore from '@/store/uiStore'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PageHeader from '@/components/common/PageHeader'
import { Plus, Edit, Trash2, Package, Eye, Printer, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import PDFPreviewModal from '@/components/common/PDFPreviewModal'
import * as XLSX from 'xlsx'

const FIELD_MAP = {
  nama: ['nama', 'nama barang', 'produk', 'nama produk', 'item', 'barang'],
  kategori: ['kategori', 'category', 'kategori barang', 'jenis'],
  stok: ['stok', 'qty', 'quantity', 'jumlah', 'stok awal', 'stock'],
  stok_minimum: ['stok minimum', 'stok min', 'min stok', 'minimum stok', 'min stock', 'minimum', 'batas stok', 'limit stok'],
  harga_beli: ['harga beli', 'harga_beli', 'harga modal', 'modal', 'beli', 'cost price'],
  harga_jual: ['harga jual', 'harga_jual', 'harga', 'harga jual', 'jual', 'selling price'],
  satuan: ['satuan', 'unit', 'uom', 'ukuran'],
  supplier: ['supplier', 'pemasok', 'vendor', 'penyuplai'],
  gudang: ['gudang', 'warehouse', 'lokasi', 'penyimpanan'],
  barcode: ['barcode', 'kode', 'sku', 'kode barang'],
  kode_barang: ['kode_barang', 'kode barang', 'kode', 'sku'],
}

function autoMapFields(headers) {
  const map = {}
  headers.forEach(h => {
    const hl = h.toLowerCase().trim()
    for (const [field, keywords] of Object.entries(FIELD_MAP)) {
      if (keywords.some(k => hl === k || hl.includes(k))) {
        map[h] = field
        break
      }
    }
  })
  return map
}

function getStokStatus(b) {
  if (b.stok === 0) return { label: 'Habis', class: 'bg-red-100 text-red-700 border-red-200' }
  if (b.stok < b.stok_minimum) return { label: 'Limit', class: 'bg-amber-100 text-amber-700 border-amber-200' }
  return { label: 'Tersedia', class: 'bg-green-100 text-green-700 border-green-200' }
}

export default function BarangPage() {
  const triggerNotifRefresh = useUiStore(s => s.triggerNotifRefresh)
  const [data, setData] = useState([])
  const [kategoriList, setKategoriList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [showPDF, setShowPDF] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importStep, setImportStep] = useState(1)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importMapping, setImportMapping] = useState({})
  const [importHeaders, setImportHeaders] = useState([])
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importData, setImportData] = useState(null)
  const [form, setForm] = useState({})
  const [selected, setSelected] = useState([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const fileRef = useRef(null)

  const defaultForm = { nama: '', kategori_id: '', stok: '', stok_minimum: 10, satuan: 'PCS' }

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
    const status = getStokStatus(b).label
    const matchStatus = !filterStatus || status === filterStatus
    return matchSearch && matchKategori && matchStatus
  })

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({ nama: item.nama, kategori_id: item.kategori_id, stok_minimum: item.stok_minimum, satuan: item.satuan })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama?.trim()) return toast.error('Nama barang wajib diisi')
    try {
      const payload = { ...form, stok_minimum: Number(form.stok_minimum), kategori_id: form.kategori_id ? Number(form.kategori_id) : null, status: 'aktif' }
      if (editItem) { delete payload.stok; await api.put(`/barang/${editItem.id}`, payload); toast.success('Barang berhasil diupdate') }
      else { payload.stok = Number(form.stok || 0); await api.post('/barang', payload); toast.success('Barang berhasil ditambahkan') }
      setShowModal(false); fetchData(); triggerNotifRefresh()
    } catch { toast.error('Gagal menyimpan data') }
  }

  const handleDelete = async () => {
    try { await api.delete(`/barang/${showDelete}`); toast.success('Barang berhasil dihapus'); setShowDelete(null); fetchData(); triggerNotifRefresh() }
    catch { toast.error('Gagal menghapus data') }
  }

  const handleBulkDelete = async () => {
    try { await api.post('/barang/bulk-delete', { ids: selected }); toast.success(`${selected.length} barang berhasil dihapus`); setSelected([]); setShowBulkDelete(false); fetchData(); triggerNotifRefresh() }
    catch { toast.error('Gagal menghapus data') }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportFile(file)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' })
        if (json.length === 0) { toast.error('File kosong'); return }
        if (json.length > 1000) { toast.error('Maksimal 1000 baris'); return }

        setImportData(json)
        const headers = Object.keys(json[0])
        setImportHeaders(headers)
        setImportPreview(json.slice(0, 5))
        setImportMapping(autoMapFields(headers))
        setImportStep(2)
      } catch { toast.error('Gagal membaca file') }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    setImportLoading(true)
    setImportResult(null)
    try {
      const mapped = importData.map(row => {
        const item = {}
        Object.entries(importMapping).forEach(([header, field]) => {
          if (field) item[field] = row[header]
        })
        return item
      })

      const res = await api.post('/barang/import', { data: mapped })
      setImportResult(res.data)
      if (res.data.success > 0) toast.success(`${res.data.success} barang berhasil diimport`)
      if (res.data.errors?.length > 0) toast.error(`${res.data.errors.length} baris gagal`)
      if (res.data.success === 0 && !res.data.errors?.length) toast.error('Tidak ada data diimport')
      fetchData(); triggerNotifRefresh()
    } catch (err) { toast.error(err?.response?.data?.message || 'Gagal import data') }
    setImportLoading(false)
  }

  const resetImport = () => {
    setImportStep(1)
    setImportFile(null)
    setImportPreview([])
    setImportMapping({})
    setImportHeaders([])
    setImportResult(null)
    setImportData(null)
    setImportLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const columns = [
    { header: (
      <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
        onChange={() => { if (selected.length === filtered.length) setSelected([]); else setSelected(filtered.map(d => d.id)) }}
        className="w-4 h-4 rounded border-border accent-primary" />
    ), accessor: (row) => (
      <input type="checkbox" checked={selected.includes(row.id)} onChange={() => setSelected(p => p.includes(row.id) ? p.filter(x => x !== row.id) : [...p, row.id])}
        className="w-4 h-4 rounded border-border accent-primary" />
    ), width: '40px' },
    { header: 'No', accessor: (_, i) => i + 1, width: '50px' },
    { header: 'Nama Barang', accessor: (row) => <div className="flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground shrink-0" /><span className="truncate">{row.nama}</span></div> },
    { header: 'Kategori', accessor: (row) => kMap[row.kategori_id]?.nama || '-' },
    { header: 'Stok', accessor: (row) => <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", getStokStatus(row).class)}>{row.stok} {row.satuan}</span> },
    { header: 'Status', accessor: (row) => {
      const s = getStokStatus(row)
      const icon = s.label === 'Habis' ? XCircle : s.label === 'Limit' ? AlertCircle : CheckCircle2
      return (
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit", s.class)}>
          <icon className="w-3.5 h-3.5" />
          {s.label}
        </div>
      )
    }},
    { header: 'Aksi', accessor: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setShowDetail(row)} className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg"><Eye className="w-4 h-4" /></button>
        <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
        <button onClick={() => setShowDelete(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>
    ), width: '120px' },
  ]

  const inputCls = "w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <div className="space-y-6">
      <PageHeader title="Barang" subtitle="Kelola data barang" actions={
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={() => setShowBulkDelete(true)} className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90">
              <Trash2 className="w-4 h-4" /> Hapus ({selected.length})
            </button>
          )}
          <button onClick={() => setShowPDF(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"><Printer className="w-4 h-4" /> Cetak PDF</button>
          <button onClick={() => { setImportStep(1); setImportLoading(false); setImportResult(null); setImportFile(null); setShowImport(true) }} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"><Upload className="w-4 h-4" /> Import Excel</button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4" /> Tambah Barang</button>
        </div>
      } />
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Cari nama barang..." value={search} onChange={e => setSearch(e.target.value)} className={cn(inputCls, "max-w-sm")} />
          <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className={cn(inputCls, "max-w-[180px]")}>
            <option value="">Semua Kategori</option>
            {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={cn(inputCls, "max-w-[150px]")}>
            <option value="">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Limit">Limit</option>
            <option value="Habis">Habis</option>
          </select>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} searchable={false} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Barang' : 'Tambah Barang'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Nama Barang *</label><input type="text" value={form.nama || ''} onChange={e => setForm({...form, nama: e.target.value})} className={inputCls} required /></div>
            <div><label className="block text-sm font-medium mb-1">Kategori</label><select value={form.kategori_id || ''} onChange={e => setForm({...form, kategori_id: e.target.value})} className={inputCls}><option value="">Pilih</option>{kategoriList.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Satuan</label><select value={form.satuan || 'PCS'} onChange={e => setForm({...form, satuan: e.target.value})} className={inputCls}>{['PCS','BOX','PACK','UNIT','KG','LITER','METER','DUS','BOTOL','KARUNG'].map(s=><option key={s}>{s}</option>)}</select></div>
            {!editItem && <div><label className="block text-sm font-medium mb-1">Stok Awal</label><input type="number" value={form.stok || ''} onChange={e => setForm({...form, stok: e.target.value})} className={inputCls} /></div>}
            <div><label className="block text-sm font-medium mb-1">Stok Minimum</label><input type="number" value={form.stok_minimum || ''} onChange={e => setForm({...form, stok_minimum: e.target.value})} className={inputCls} /></div>
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
              ['Status Stok', getStokStatus(showDetail).label],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-border last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{val || '-'}</span></div>
            ))}
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} title="Hapus Barang" message="Barang yang dihapus tidak dapat dikembalikan." variant="danger" />

      <ConfirmDialog isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} onConfirm={handleBulkDelete}
        title="Hapus Barang Terpilih" message={`${selected.length} barang akan dihapus. Yakin?`} variant="danger" />

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
            { header: 'Status', accessor: (row) => getStokStatus(row).label },
          ]}
          data={filtered}
        />
      )}

      {/* Import Modal */}
      <Modal isOpen={showImport} onClose={() => { setShowImport(false); resetImport() }} title="Import Excel" size="lg">
        {importStep === 1 && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-cyan-100 rounded-2xl flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Upload File Excel</h3>
              <p className="text-sm text-muted-foreground mb-6">Format .xlsx atau .xls, maksimal 1000 baris</p>
              <label className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-cyan-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Pilih File
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} hidden />
              </label>
            </div>
          </div>
        )}

        {importStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
              <span className="font-medium text-foreground">{importFile?.name}</span>
              <button onClick={resetImport} className="text-xs text-primary hover:underline ml-2">Ganti file</button>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Mapping Kolom</h4>
              <div className="grid grid-cols-2 gap-2">
                {importHeaders.map(h => (
                  <div key={h} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground w-1/3 truncate">{h}</span>
                    <span className="text-xs">→</span>
                    <select value={importMapping[h] || ''} onChange={e => setImportMapping({...importMapping, [h]: e.target.value})} className="flex-1 text-xs bg-background border border-input rounded-md px-2 py-1">
                      <option value="">- Lewati -</option>
                      {Object.keys(FIELD_MAP).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Preview ({importPreview.length} baris pertama)</h4>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      {importHeaders.filter(h => importMapping[h]).map(h => <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        {importHeaders.filter(h => importMapping[h]).map(h => <td key={h} className="px-3 py-2 whitespace-nowrap">{String(row[h] ?? '')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {importResult && (
              <div className={cn("rounded-xl p-4 text-sm border", importResult.errors?.length ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200")}>
                <div className="flex items-center gap-2 font-medium mb-1">
                  {importResult.errors?.length ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {importResult.success} barang berhasil diimport
                </div>
                {importResult.errors?.length > 0 && (
                  <div className="mt-2 text-red-600 text-xs max-h-32 overflow-y-auto">
                    {importResult.errors.map((e, i) => <div key={i} className="py-0.5">{e}</div>)}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={resetImport} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Batal</button>
              <button onClick={handleImport} disabled={importLoading || Object.values(importMapping).filter(Boolean).length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors">
                {importLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Import...</> : 'Import'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
