import { useState, useEffect, useMemo, useCallback } from 'react'
import api from '@/api/client'
import PageHeader from '@/components/common/PageHeader'
import PDFPreviewModal from '@/components/common/PDFPreviewModal'
import { Printer, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'barang', label: 'Barang', icon: FileText },
  { key: 'stok_masuk_keluar', label: 'Stok Masuk & Keluar', icon: FileText, dateFilter: true },
  { key: 'riwayat_stok', label: 'Riwayat Stok', icon: FileText, dateFilter: true },
]

const tipeBadge = {
  Masuk: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Keluar: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState('barang')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pdfOpen, setPdfOpen] = useState(false)

  const [barangs, setBarangs] = useState([])
  const [stokMasuk, setStokMasuk] = useState([])
  const [stokKeluar, setStokKeluar] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [brg, sm, sk] = await Promise.all([
        api.get('/barang'),
        api.get('/stok_masuk'),
        api.get('/stok_keluar'),
      ])
      setBarangs(brg.data)
      setStokMasuk(sm.data)
      setStokKeluar(sk.data)
    } catch {
      console.error('Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => { setSearch(''); setDateFrom(''); setDateTo('') }, [activeTab])

  const getBarangName = (id) => barangs.find(b => String(b.id) === String(id))?.nama || '-'

  const stokMasukKeluarData = useMemo(() => {
    const items = []
    stokMasuk.forEach(sm => {
      items.push({
        id: `sm-${sm.id}`,
        tanggal: sm.tanggal,
        barang: getBarangName(sm.barang_id),
        tipe: 'Masuk',
        dariKe: sm.dari_siapa || '-',
        qty: sm.qty,
        keterangan: sm.keterangan || '-',
      })
    })
    stokKeluar.forEach(sk => {
      items.push({
        id: `sk-${sk.id}`,
        tanggal: sk.tanggal,
        barang: getBarangName(sk.barang_id),
        tipe: 'Keluar',
        dariKe: sk.tujuan || '-',
        qty: sk.qty,
        keterangan: sk.keterangan || '-',
      })
    })
    items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    return items
  }, [barangs, stokMasuk, stokKeluar])

  const riwayatStokData = useMemo(() => {
    const barangMap = {}
    barangs.forEach(b => { barangMap[b.id] = b })

    const items = []
    stokMasuk.forEach(sm => {
      const brg = barangMap[sm.barang_id]
      const stokSesudah = brg ? brg.stok : 0
      const stokSebelum = stokSesudah - (sm.qty || 0)
      items.push({
        id: `sm-${sm.id}`,
        tanggal: sm.tanggal,
        barang: getBarangName(sm.barang_id),
        tipe: 'Masuk',
        qty: sm.qty,
        stokSebelum,
        stokSesudah,
        keterangan: sm.keterangan || '-',
      })
    })
    stokKeluar.forEach(sk => {
      const brg = barangMap[sk.barang_id]
      const stokSesudah = brg ? brg.stok : 0
      const stokSebelum = stokSesudah + (sk.qty || 0)
      items.push({
        id: `sk-${sk.id}`,
        tanggal: sk.tanggal,
        barang: getBarangName(sk.barang_id),
        tipe: 'Keluar',
        qty: sk.qty,
        stokSebelum,
        stokSesudah,
        keterangan: sk.keterangan || '-',
      })
    })
    items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    return items
  }, [barangs, stokMasuk, stokKeluar])

  const filteredBarang = useMemo(() => {
    if (!search) return barangs
    const q = search.toLowerCase()
    return barangs.filter(b =>
      (b.nama || '').toLowerCase().includes(q) ||
      (b.kode || '').toLowerCase().includes(q)
    )
  }, [barangs, search])

  const filteredStokMasukKeluar = useMemo(() => {
    let items = stokMasukKeluarData
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i => i.barang.toLowerCase().includes(q))
    }
    if (dateFrom) items = items.filter(i => i.tanggal >= dateFrom)
    if (dateTo) items = items.filter(i => i.tanggal <= dateTo)
    return items
  }, [stokMasukKeluarData, search, dateFrom, dateTo])

  const filteredRiwayatStok = useMemo(() => {
    let items = riwayatStokData
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i => i.barang.toLowerCase().includes(q))
    }
    if (dateFrom) items = items.filter(i => i.tanggal >= dateFrom)
    if (dateTo) items = items.filter(i => i.tanggal <= dateTo)
    return items
  }, [riwayatStokData, search, dateFrom, dateTo])

  const hasDateFilter = TABS.find(t => t.key === activeTab)?.dateFilter

  const getPdfProps = () => {
    switch (activeTab) {
      case 'barang':
        return {
          title: 'Laporan Barang',
          filename: 'laporan-barang',
          columns: [
            { header: 'No', accessor: (_, i) => i + 1 },
            { header: 'Kode', accessor: 'kode' },
            { header: 'Nama', accessor: 'nama' },
            { header: 'Kategori', accessor: (row) => row.kategori?.nama || '-' },
            { header: 'Stok', accessor: 'stok' },
            { header: 'Satuan', accessor: (row) => row.satuan || '-' },
          ],
          data: filteredBarang,
        }
      case 'stok_masuk_keluar':
        return {
          title: 'Laporan Stok Masuk & Keluar',
          filename: 'laporan-stok-masuk-keluar',
          columns: [
            { header: 'No', accessor: (_, i) => i + 1 },
            { header: 'Tanggal', accessor: 'tanggal' },
            { header: 'Barang', accessor: 'barang' },
            { header: 'Tipe', accessor: 'tipe' },
            { header: 'Dari Siapa / Ke Tujuan', accessor: 'dariKe' },
            { header: 'Qty', accessor: 'qty' },
            { header: 'Keterangan', accessor: 'keterangan' },
          ],
          data: filteredStokMasukKeluar,
        }
      case 'riwayat_stok':
        return {
          title: 'Laporan Riwayat Stok',
          filename: 'laporan-riwayat-stok',
          columns: [
            { header: 'No', accessor: (_, i) => i + 1 },
            { header: 'Tanggal', accessor: 'tanggal' },
            { header: 'Barang', accessor: 'barang' },
            { header: 'Tipe', accessor: 'tipe' },
            { header: 'Qty', accessor: 'qty' },
            { header: 'Stok Sebelum', accessor: 'stokSebelum' },
            { header: 'Stok Sesudah', accessor: 'stokSesudah' },
            { header: 'Keterangan', accessor: 'keterangan' },
          ],
          data: filteredRiwayatStok,
        }
      default:
        return { title: '', filename: '', columns: [], data: [] }
    }
  }

  const pdfProps = getPdfProps()

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )
    }

    switch (activeTab) {
      case 'barang':
        return renderBarangTable()
      case 'stok_masuk_keluar':
        return renderStokMasukKeluarTable()
      case 'riwayat_stok':
        return renderRiwayatStokTable()
      default:
        return null
    }
  }

  const renderBarangTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {['No', 'Kode', 'Nama', 'Kategori', 'Stok', 'Satuan'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredBarang.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Tidak ada data</td></tr>
          ) : filteredBarang.map((row, i) => (
            <tr key={row.id || i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">{i + 1}</td>
              <td className="px-4 py-3">{row.kode}</td>
              <td className="px-4 py-3">{row.nama}</td>
              <td className="px-4 py-3">{row.kategori?.nama || '-'}</td>
              <td className="px-4 py-3">{row.stok}</td>
              <td className="px-4 py-3">{row.satuan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderStokMasukKeluarTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {['No', 'Tanggal', 'Barang', 'Tipe', 'Dari Siapa / Ke Tujuan', 'Qty', 'Keterangan'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredStokMasukKeluar.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Tidak ada data</td></tr>
          ) : filteredStokMasukKeluar.map((row, i) => (
            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">{i + 1}</td>
              <td className="px-4 py-3">{row.tanggal}</td>
              <td className="px-4 py-3">{row.barang}</td>
              <td className="px-4 py-3">
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', tipeBadge[row.tipe])}>
                  {row.tipe}
                </span>
              </td>
              <td className="px-4 py-3">{row.dariKe}</td>
              <td className="px-4 py-3">{row.qty}</td>
              <td className="px-4 py-3">{row.keterangan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderRiwayatStokTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {['No', 'Tanggal', 'Barang', 'Tipe', 'Qty', 'Stok Sebelum', 'Stok Sesudah', 'Keterangan'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRiwayatStok.length === 0 ? (
            <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Tidak ada data</td></tr>
          ) : filteredRiwayatStok.map((row, i) => (
            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">{i + 1}</td>
              <td className="px-4 py-3">{row.tanggal}</td>
              <td className="px-4 py-3">{row.barang}</td>
              <td className="px-4 py-3">
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', tipeBadge[row.tipe] || 'bg-gray-100 text-gray-700')}>
                  {row.tipe}
                </span>
              </td>
              <td className="px-4 py-3">{row.qty}</td>
              <td className="px-4 py-3">{row.stokSebelum}</td>
              <td className="px-4 py-3">{row.stokSesudah}</td>
              <td className="px-4 py-3">{row.keterangan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        subtitle="Lihat dan cetak laporan data"
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-lg text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {hasDateFilter && (
            <>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground text-sm">s/d</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </>
          )}
          <div className="sm:ml-auto">
            <button
              onClick={() => setPdfOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak PDF
            </button>
          </div>
        </div>

        {renderTable()}
      </div>

      <PDFPreviewModal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        title={pdfProps.title}
        columns={pdfProps.columns}
        data={pdfProps.data}
        filename={pdfProps.filename}
      />
    </div>
  )
}
