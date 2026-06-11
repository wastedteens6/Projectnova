import api from '../lib/api';
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import { 
  HiOutlineShoppingCart, 
  HiOutlineUser, 
  HiOutlineCreditCard, 
  HiOutlinePaintBrush, 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineShieldCheck, 
  HiOutlineCube, 
  HiOutlineUsers, 
  HiOutlineCog6Tooth, 
  HiOutlineArrowLeftOnRectangle 
} from 'react-icons/hi2'

export default function Navbar() {
  const { theme } = useTheme()
  const { settings } = useSettings()
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  const userName = localStorage.getItem('userName') || 'User'
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      const { authService } = await import('../services/api')
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('cart')
    localStorage.removeItem('savedProjects')
    localStorage.removeItem('upgradeContext')
    window.location.href = '/auth/login'
  }

  const userMenuItems = [
    { label: 'My Dashboard', path: '/dashboard', icon: <HiOutlineUser className="w-4 h-4" /> },
    { label: 'My Purchases', path: '/dashboard#purchases', icon: <HiOutlineCreditCard className="w-4 h-4" /> },
    { label: 'Custom Requests', path: '/dashboard#custom', icon: <HiOutlinePaintBrush className="w-4 h-4" /> },
    { label: 'Support Tickets', path: '/support', icon: <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> },
  ]

  const adminMenuItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <HiOutlineShieldCheck className="w-4 h-4" /> },
  ]

  return (
    <nav className={`pointer-events-auto fixed top-0 w-full z-50 transition-all duration-300 ${
      isLight 
        ? 'bg-white/90 backdrop-blur border-b border-purple-200/50 shadow-md shadow-purple-200/20' 
        : 'bg-slate-950/95 backdrop-blur border-b border-slate-800'
    }`}>
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section: Back Button + Logo */}
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg hover:scale-110 transition transform ${
                  isLight ? 'text-purple-600 hover:bg-purple-100' : 'text-cyan-400 hover:bg-slate-800'
                }`}
                title="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            <a href="/" className="flex items-center gap-3 group">
              <div className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105">
                <img 
                  src={settings.logo ? `${import.meta.env.VITE_API_URL||'http://localhost:5000'}${settings.logo}` : "/logo.svg"} 
                  alt={`${settings.siteName} Logo`} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <span className={`text-lg font-black transition-all duration-300 ${
                isLight
                  ? 'bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent'
              }`}>
                {settings.siteName}
              </span>
            </a>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex gap-8">
            <a href="/" className={`transition font-bold text-sm ${isLight ? 'text-slate-600 hover:text-purple-600' : 'text-slate-400 hover:text-cyan-400'}`}>Home</a>
            <a href="/projects" className={`transition font-bold text-sm ${isLight ? 'text-slate-600 hover:text-purple-600' : 'text-slate-400 hover:text-cyan-400'}`}>Browse</a>
            {token && (
              <>
                <a href="/projects/custom" className={`transition font-bold text-sm ${isLight ? 'text-slate-600 hover:text-purple-600' : 'text-slate-400 hover:text-cyan-400'}`}>Custom</a>
                <a href="/support" className={`transition font-bold text-sm ${isLight ? 'text-slate-600 hover:text-purple-600' : 'text-slate-400 hover:text-cyan-400'}`}>Support</a>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            
            {token ? (
              <div className="flex items-center gap-3" ref={menuRef}>
                <NotificationBell />
                
                {/* Cart Icon (Visible if logged in) */}
                {token && (
                  <a href="/cart" className={`relative p-2 rounded-lg transition transform hover:scale-110 ${
                    isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                  }`} title="View Cart">
                    <HiOutlineShoppingCart className="w-5 h-5" />

                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                  </a>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                      isLight 
                        ? 'border-slate-200 bg-slate-50 hover:border-purple-300' 
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {userName[0]}
                    </div>
                    <span className={`text-xs font-bold hidden sm:inline ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {userName.split(' ')[0]}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl animate-fade-in overflow-hidden z-[60] ${
                      isLight ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className={`p-4 border-b ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/50 border-slate-800'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Logged in as</p>
                        <p className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{userName}</p>
                        <p className={`text-[10px] font-medium opacity-60 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{userRole}</p>
                      </div>
                      
                      <div className="p-2">
                        {(userRole === 'admin' ? adminMenuItems : userMenuItems).map((item) => (
                          <button
                            key={item.label}
                            onClick={() => { navigate(item.path); setShowUserMenu(false) }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isLight ? 'text-slate-600 hover:bg-purple-50 hover:text-purple-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="text-sm">{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <div className={`p-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                        <button 
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 transition-all ${
                            isLight ? 'hover:bg-red-50' : 'hover:bg-red-500/10'
                          }`}
                        >
                          <HiOutlineArrowLeftOnRectangle className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <a href="/auth/login" className={`px-6 py-2 rounded-full text-xs font-black transition transform hover:scale-105 ${
                isLight
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}>
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
