import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineShieldCheck, 
  HiOutlineCube, 
  HiOutlinePlus, 
  HiOutlinePaintBrush, 
  HiOutlineClipboardDocumentList, 
  HiOutlineCreditCard, 
  HiOutlineChatBubbleLeftRight, 
  HiOutlinePresentationChartLine, 
  HiOutlineCog6Tooth, 
  HiOutlineArrowLeftOnRectangle 
} from 'react-icons/hi2'

const AVAILABLE_PERMISSIONS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <HiOutlineChartBar /> },
  { path: '/admin/users', label: 'Manage Users', icon: <HiOutlineUsers /> },
  { path: '/admin/roles', label: 'Manage Roles', icon: <HiOutlineShieldCheck /> },
  { path: '/admin/projects', label: 'Manage Projects', icon: <HiOutlineCube /> },
  { path: '/admin/projects/create', label: 'Create Project', icon: <HiOutlinePlus /> },
  { path: '/admin/custom-projects', label: 'Custom Requests', icon: <HiOutlinePaintBrush /> },
  { path: '/admin/orders', label: 'Orders', icon: <HiOutlineClipboardDocumentList /> },
  { path: '/admin/purchases', label: 'Purchases', icon: <HiOutlineCreditCard /> },
  { path: '/admin/support', label: 'Support', icon: <HiOutlineChatBubbleLeftRight /> },
  { path: '/admin/analytics', label: 'Analytics', icon: <HiOutlinePresentationChartLine /> },
  { path: '/admin/settings', label: 'Settings', icon: <HiOutlineCog6Tooth /> },
]

export default function AdminSidebar() {
  const { theme } = useTheme()
  const { settings } = useSettings()
  const isLight = theme === 'light'
  const location = useLocation()
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  let permissions: string[] = []
  let userRole = 'user'
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      permissions = payload.permissions || []
      userRole = payload.role
    }
  } catch(e) {}

  const hasAccess = (path: string) => {
    if (userRole === 'admin') return true
    return permissions.some(p => path === p || path.startsWith(p + '/'))
  }

  const handleLogout = async () => {
    try {
      const { authService } = await import('../services/api')
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    navigate('/auth/login')
  }

  return (
    <aside className={`w-64 flex-shrink-0 min-h-screen border-r flex flex-col sticky top-0 pointer-events-auto transition-colors ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className={`p-6 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <Link to="/" className="flex items-center gap-3 mb-4 group cursor-pointer no-underline">
          <div className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105">
            <img 
              src={settings.logo ? `http://localhost:5000${settings.logo}` : "/logo.svg"} 
              alt={`${settings.siteName} Icon`} 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <h2 className={`font-bold text-lg leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-purple-600 transition-colors`}>
              <span className="text-purple-600">{settings.siteName.split(' ')[0]}</span>
            </h2>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Admin Panel</span>
          </div>
        </Link>
        <div>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {userRole}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {AVAILABLE_PERMISSIONS.map(item => {
          if (!hasAccess(item.path)) return null;
          
          const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path + '/'))
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? isLight ? 'bg-purple-50 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                  : isLight ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={`p-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          }`}
        >
          <HiOutlineArrowLeftOnRectangle className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  )
}
