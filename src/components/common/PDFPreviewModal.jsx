import { useRef } from 'react'
import { X, Download, Printer } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PDFPreviewModal({ isOpen, onClose, title, columns, data, filename = 'report' }) {
  const contentRef = useRef(null)

  if (!isOpen) return null

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(title, pageWidth / 2, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth / 2, 22, { align: 'center' })

    const tableHeaders = columns.map(c => c.header)
    const tableData = data.map(row => columns.map(c => {
      const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor]
      return val != null ? String(val) : '-'
    }))

    autoTable(doc, {
      startY: 28,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
    }

    return doc
  }

  const handlePrint = () => {
    const doc = generatePDF()
    doc.autoPrint()
    window.open(doc.output('bloburl'), '_blank')
  }

  const handleDownload = () => {
    const doc = generatePDF()
    doc.save(`${filename}.pdf`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Preview: {title}</h2>
            <p className="text-sm text-muted-foreground">{data.length} data ditampilkan</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div ref={contentRef} className="flex-1 overflow-auto px-6 py-4">
          <table className="w-full text-sm border border-border">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                {columns.map(col => (
                  <th key={col.header} className="px-3 py-2 text-left font-medium text-xs">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">Tidak ada data</td></tr>
              ) : data.map((row, i) => (
                <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-white dark:bg-card' : 'bg-muted/30'}`}>
                  {columns.map(col => (
                    <td key={col.header} className="px-3 py-2 text-sm">
                      {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            Tutup
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>
      </div>
    </div>
  )
}
