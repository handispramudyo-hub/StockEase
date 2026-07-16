import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DataTable({ columns, data = [], loading = false, searchable = true, onSearch, searchPlaceholder, emptyMessage = 'Tidak ada data', pageSize: initialPageSize = 10 }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const handleSearch = (val) => { setSearch(val); onSearch?.(val); setPage(1) }

  const filtered = useMemo(() => {
    if (onSearch || !search) return data
    return data.filter(row => columns.some(c => {
      const val = typeof c.accessor === 'function' ? '' : row[c.accessor]
      return String(val || '').toLowerCase().includes(search.toLowerCase())
    }))
  }, [data, search, columns, onSearch])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = typeof columns.find(c => c.header === sortKey)?.accessor === 'function' ? '' : a[columns.find(c => c.header === sortKey)?.accessor]
      const bVal = typeof columns.find(c => c.header === sortKey)?.accessor === 'function' ? '' : b[columns.find(c => c.header === sortKey)?.accessor]
      if (aVal == null) return 1; if (bVal == null) return -1
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir, columns])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (header) => {
    if (sortKey === header) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(header); setSortDir('asc') }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div>
      {searchable && (
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <input type="text" placeholder={searchPlaceholder || 'Cari...'} value={search} onChange={e => handleSearch(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-lg text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value={10}>10 / halaman</option><option value={25}>25 / halaman</option><option value={50}>50 / halaman</option>
          </select>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map(col => (
                <th key={col.header} onClick={() => col.sortable !== false && toggleSort(col.header)}
                  className={cn("px-4 py-3 text-left font-medium text-muted-foreground", col.sortable !== false && "cursor-pointer hover:text-foreground select-none")}
                  style={col.width ? { width: col.width } : undefined}>
                  <span className="flex items-center gap-1">{col.header}
                    {sortKey === col.header && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">{emptyMessage}</td></tr>
            ) : paged.map((row, i) => (
              <tr key={row.id || i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                {columns.map(col => (
                  <td key={col.header} className="px-4 py-3" style={col.width ? { width: col.width } : undefined}>
                    {typeof col.accessor === 'function' ? col.accessor(row, (page - 1) * pageSize + i) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">Menampilkan {(page-1)*pageSize+1}-{Math.min(page*pageSize, sorted.length)} dari {sorted.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              let p; if (totalPages <= 5) p = i+1; else if (page <= 3) p = i+1; else if (page >= totalPages-2) p = totalPages-4+i; else p = page-2+i
              return <button key={p} onClick={() => setPage(p)} className={cn("w-8 h-8 rounded-lg text-sm font-medium", page===p ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{p}</button>
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
