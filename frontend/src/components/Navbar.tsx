import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  const handleLogout = () => {
    // SECURITY FIX: Clear all user-related data on logout
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('cart')
    localStorage.removeItem('savedProjects')
    localStorage.removeItem('upgradeContext')
    
    // Redirect to login
    window.location.href = '/auth/login'
  }

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
                  isLight
                    ? 'text-purple-600 hover:bg-purple-100'
                    : 'text-cyan-400 hover:bg-slate-800'
                }`}
                title="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="WastedTeens Logo" className="w-8 h-8 group-hover:scale-110 transition" />
              <span className={`text-lg font-black transition-all duration-300 ${
                isLight
                  ? 'bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent'
              }`}>
                WastedTeens☠️
              </span>
            </a>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex gap-8">
            <a href="/" className={`transition font-medium ${
              isLight ? 'text-slate-600 hover:text-purple-600' : 'text-slate-300 hover:text-cyan-400'
            }`}>
              Home
            </a>
            <a href="/projects" className={`transition font-medium ${
              isLight ? 'text-slate-600 hover:text-purple-600' : 'text-slate-300 hover:text-cyan-400'
            }`}>
              Browse
            </a>
            <a href="/projects/custom" className={`transition font-medium ${
              isLight ? 'text-slate-600 hover:text-blue-600' : 'text-slate-300 hover:text-blue-400'
            }`}>
              Custom Projects
            </a>
          </div>

          {/* Right Section */}
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            {token ? (
              <div className="flex gap-2">
                {userRole === 'user' && (
                  <a href="/dashboard" className={`px-6 py-2 rounded-lg font-bold transition transform hover:scale-105 flex items-center gap-2 ${
                    isLight
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                  }`}>
                    <span>👤</span> My Profile
                  </a>
                )}
                <button onClick={handleLogout} className={`px-6 py-2 rounded-lg font-bold transition transform hover:scale-105 ${
                  isLight
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-lg hover:shadow-red-500/50'
                }`}>
                  Logout
                </button>
              </div>
            ) : (
              <a href="/auth/login" className={`px-6 py-2 rounded-lg font-bold transition transform hover:scale-105 ${
                isLight
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
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
