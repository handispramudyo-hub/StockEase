import { useState, useEffect, useMemo, useCallback } from 'react'
import api from '@/api/client'
import DataTable from '@/components/common/DataTable'
import PageHeader from '@/components/common/PageHeader'
import { cn } from '@/lib/utils'

  const tipeBadge = {
  Masuk: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Keluar: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function RiwayatStokPage() {
  const [barangs, setBarangs] = useState([])
  const [stokMasuk, setStokMasuk] = useState([])
  const [stokKeluar, setStokKeluar] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTipe, setFilterTipe] = useState('Semua')

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
      console.error('Gagal memuat riwayat stok')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const getBarangName = (id) => barangs.find(b => String(b.id) === String(id))?.nama || '-'

  const history = useMemo(() => {
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

  const filtered = useMemo(() => {
    if (filterTipe === 'Semua') return history
    return history.filter(h => h.tipe === filterTipe)
  }, [history, filterTipe])

  const columns = [
    { header: 'No', accessor: (_, i) => i + 1, width: '50px' },
    { header: 'Tanggal', accessor: 'tanggal' },
    { header: 'Barang', accessor: 'barang' },
    { header: 'Tipe', accessor: (row) => (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', tipeBadge[row.tipe])}>
        {row.tipe}
      </span>
    ) },
    { header: 'Qty', accessor: (row) => row.qty },
    { header: 'Stok Sebelum', accessor: (row) => row.stokSebelum },
    { header: 'Stok Sesudah', accessor: (row) => row.stokSesudah },
    { header: 'Keterangan', accessor: (row) => row.keterangan },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Stok" subtitle="Lihat seluruh riwayat pergerakan stok" />

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Filter Tipe:</label>
          <select value={filterTipe} onChange={e => setFilterTipe(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="Semua">Semua</option>
            <option value="Masuk">Masuk</option>
            <option value="Keluar">Keluar</option>
          </select>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} searchPlaceholder="Cari riwayat..." emptyMessage="Belum ada riwayat stok" />
      </div>
    </div>
  )
}
