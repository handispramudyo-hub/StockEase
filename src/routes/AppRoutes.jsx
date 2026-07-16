import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProtectedRoute from './ProtectedRoute'
import KategoriPage from '@/pages/kategori/KategoriPage'
import BarangPage from '@/pages/barang/BarangPage'
import StokMasukPage from '@/pages/stok/StokMasukPage'
import StokKeluarPage from '@/pages/stok/StokKeluarPage'
import RiwayatStokPage from '@/pages/stok/RiwayatStokPage'
import LaporanPage from '@/pages/laporan/LaporanPage'
import UserPage from '@/pages/user/UserPage'
import SettingsPage from '@/pages/settings/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="kategori" element={<KategoriPage />} />
        <Route path="barang" element={<BarangPage />} />
        <Route path="stok-masuk" element={<StokMasukPage />} />
        <Route path="stok-keluar" element={<StokKeluarPage />} />
        <Route path="riwayat-stok" element={<RiwayatStokPage />} />
        <Route path="laporan" element={<LaporanPage />} />
        <Route path="users" element={<UserPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
