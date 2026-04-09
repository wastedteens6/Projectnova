import React, { useState } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

export default function AdminLogin() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin-login', { email, password })
      
      if (res.data.user?.role !== 'admin') {
        setError('Only admins can access this panel')
        setLoading(false)
        return
      }
      
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userRole', res.data.user.role)
      localStorage.setItem('userName', res.data.user.name)
      localStorage.setItem('userEmail', res.data.user.email)
      window.location.href = '/admin/dashboard'
    } catch (err) {
      setError('Admin login failed: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`py-20 min-h-screen transition-all duration-300 ${
      isLight
        ? 'bg-gradient-to-br from-slate-100 to-slate-200'
        : 'bg-gradient-to-br from-slate-900 to-slate-800'
    }`}>
      <div className="container max-w-md">
        <div className={`border-2 rounded-lg p-8 shadow-2xl transition-all duration-300 ${
          isLight
            ? 'bg-white border-purple-600 text-slate-900'
            : 'bg-slate-950 border-red-600 text-white'
        }`}>
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>WastedTeens☠️ Admin</h1>
            <p className={`transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>Administrative Access Only</p>
          </div>

          {error && (
            <div className={`mb-4 p-4 rounded-lg border transition-all duration-300 ${
              isLight
                ? 'bg-red-100 border-red-400 text-red-700'
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-slate-200'
              }`}>Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition duration-300 ${
                  isLight
                    ? 'border-slate-300 bg-white text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-200'
                    : 'border-slate-700 bg-slate-900/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="admin@wastedteens.com"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-slate-200'
              }`}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition duration-300 ${
                  isLight
                    ? 'border-slate-300 bg-white text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-200'
                    : 'border-slate-700 bg-slate-900/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'
                }`}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                isLight
                  ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                  : 'bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50'
              }`}
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>

          <div className={`text-center mt-6 pt-6 border-t transition-all duration-300 ${
            isLight ? 'border-slate-300' : 'border-slate-700'
          }`}>
            <p className={`text-sm transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Not an admin?{' '}
              <a href="/auth/login" className={`font-semibold transition duration-300 ${
                isLight
                  ? 'text-purple-600 hover:text-purple-700'
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}>
                User Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
