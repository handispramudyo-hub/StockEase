import { NavLink } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import useAppStore from '@/store/appStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Package, Tag,
  ArrowDownToLine, ArrowUpFromLine,
  ClipboardList, BarChart3, Settings, Box,
  ChevronLeft, LogOut
} from 'lucide-react'

const allMenuItems = [
  { section: 'Menu Utama', items: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', roles: ['admin', 'owner'] },
  ]},
  { section: 'Master Data', items: [
    { label: 'Kategori', icon: Tag, to: '/kategori', roles: ['admin'] },
    { label: 'Barang', icon: Package, to: '/barang', roles: ['admin'] },
  ]},
  { section: 'Transaksi', items: [
    { label: 'Stok Masuk', icon: ArrowDownToLine, to: '/stok-masuk', roles: ['admin'] },
    { label: 'Stok Keluar', icon: ArrowUpFromLine, to: '/stok-keluar', roles: ['admin'] },
  ]},
  { section: 'Log & Laporan', items: [
    { label: 'Riwayat Stok', icon: ClipboardList, to: '/riwayat-stok', roles: ['admin'] },
    { label: 'Laporan', icon: BarChart3, to: '/laporan', roles: ['admin', 'owner'] },
  ]},
  { section: 'Pengaturan', items: [
    { label: 'Users', icon: Box, to: '/users', roles: ['admin'] },
    { label: 'Pengaturan', icon: Settings, to: '/settings', roles: ['admin'] },
  ]},
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapse } = useAppStore()

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />}
      <aside className={cn("fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
        sidebarCollapsed ? "w-16" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className={cn("flex items-center h-16 px-4 border-b border-white/10 shrink-0", sidebarCollapsed && "justify-center px-0")}>
          {!sidebarCollapsed && <div className="flex items-center gap-2"><Box className="w-7 h-7 text-sidebar-primary" /><span className="text-lg font-bold">StockFlow</span></div>}
          {sidebarCollapsed && <Box className="w-6 h-6 text-sidebar-primary" />}
        </div>

        <button onClick={toggleSidebarCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-sidebar-accent rounded-full items-center justify-center border border-white/10 hover:bg-sidebar-primary transition-colors">
          <ChevronLeft className={cn("w-3 h-3 transition-transform", sidebarCollapsed && "rotate-180")} />
        </button>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {allMenuItems.filter(s => s.items.some(i => i.roles.includes(user?.role))).map(section => (
            <div key={section.section} className="mb-4">
              {!sidebarCollapsed && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">{section.section}</p>}
              <ul className="space-y-0.5">
                {section.items.filter(i => i.roles.includes(user?.role)).map(item => (
                  <li key={item.to}>
                    <NavLink to={item.to} onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                      className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        sidebarCollapsed && "justify-center px-0",
                        isActive ? "bg-sidebar-primary text-white" : "text-slate-300 hover:bg-sidebar-accent hover:text-white"
                      )} title={sidebarCollapsed ? item.label : undefined}>
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={cn("border-t border-white/10 p-3 shrink-0", sidebarCollapsed && "px-2")}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-white text-xs font-bold shrink-0">{user?.nama?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.nama}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button onClick={logout} className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors" title="Logout"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={logout} className="w-full flex justify-center p-2 hover:bg-sidebar-accent rounded-lg transition-colors"><LogOut className="w-4 h-4" /></button>
          )}
        </div>
      </aside>
    </>
  )
}
