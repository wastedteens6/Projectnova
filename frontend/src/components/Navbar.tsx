import React, { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('cart')
    localStorage.removeItem('savedProjects')
    window.location.href = '/auth/login'
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Browse' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/projects/custom', label: 'Custom' },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${
      isLight
        ? 'bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm'
        : 'bg-[#0a0a0f]/95 backdrop-blur border-b border-white/[0.06]'
    }`}>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Left: Back + Logo */}
          <div className="flex items-center gap-2">
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'
                }`}
                title="Go back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <a href="/" className="flex items-center gap-2">
              <span className={`text-base font-bold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                WastedTeens<span className="ml-0.5">☠️</span>
              </span>
            </a>
          </div>

          {/* Center: Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  isActive(link.href)
                    ? isLight
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-white/8 text-white'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: Theme + Auth */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {token ? (
              <div className="flex items-center gap-2">
                {userRole === 'user' && (
                  <a
                    href="/dashboard"
                    className={`btn btn-sm hidden sm:inline-flex ${
                      isLight ? 'btn-secondary' : 'btn-secondary'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Dashboard
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className={`btn btn-sm ${
                    isLight ? 'btn-ghost text-slate-600' : 'btn-ghost text-slate-400'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a href="/auth/login" className={`btn btn-sm ${isLight ? 'btn-ghost' : 'btn-ghost'}`}>
                  Sign in
                </a>
                <a href="/auth/register" className="btn btn-sm btn-primary">
                  Get started
                </a>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-1.5 rounded-lg ml-1 ${
                isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={`md:hidden py-3 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}`}>
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 text-sm rounded-lg font-medium mb-0.5 transition-colors ${
                  isActive(link.href)
                    ? isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/8 text-white'
                    : isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            ))}
            {token && userRole === 'user' && (
              <a href="/dashboard" className="block px-3 py-2 text-sm font-medium text-indigo-600 mt-1">
                Dashboard
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
