import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import useAppStore from '@/store/appStore'
import { cn } from '@/lib/utils'

export default function AppLayout() {
  const { sidebarCollapsed } = useAppStore()
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:ml-16" : "lg:ml-64")}>
        <Header />
        <main className="p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
