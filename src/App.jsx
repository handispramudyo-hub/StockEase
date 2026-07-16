import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    if (theme === 'dark') document.documentElement.classList.add('dark')
  }, [])

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '10px', background: 'var(--color-card)', color: 'var(--color-card-foreground)', border: '1px solid var(--color-border)' },
      }} />
    </>
  )
}
