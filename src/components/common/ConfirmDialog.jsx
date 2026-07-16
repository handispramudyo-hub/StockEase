import Modal from './Modal'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  danger: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Hapus', cancelText = 'Batal', variant = 'danger', loading = false }) {
  const v = variants[variant]
  const Icon = v.icon
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-4", v.bg)}>
          <Icon className={cn("w-7 h-7", v.color)} />
        </div>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">{cancelText}</button>
          <button onClick={onConfirm} disabled={loading}
            className={cn("flex-1 px-4 py-2.5 text-sm text-white rounded-lg font-medium transition-colors disabled:opacity-50",
              variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600')}>
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
