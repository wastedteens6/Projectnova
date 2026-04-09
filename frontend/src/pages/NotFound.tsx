import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function NotFound() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-all duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse transition-all duration-300 ${
          isLight ? 'bg-purple-400' : 'bg-purple-600'
        }`}></div>
        <div className={`absolute bottom-1/4 -right-32 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse transition-all duration-300 ${
          isLight ? 'bg-cyan-400' : 'bg-cyan-600'
        }`} style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="text-9xl font-black mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">404</span>
        </div>
        <h1 className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>Page Not Found</h1>
        <p className={`text-xl mb-12 max-w-md transition-colors duration-300 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>Oops! Looks like this page wandered off somewhere. Let's get you back on track.</p>
        <a href="/" className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105">
          ← Go Back Home
        </a>
      </div>
    </div>
  )
}
