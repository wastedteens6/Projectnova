import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminSupport() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  return (
    <div className={`min-h-screen pointer-events-none ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <header className={`border-b transition-all duration-300 pointer-events-auto ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="container max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Support Tickets</h1>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate(-1)}
              title="Go back to previous page"
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isLight 
                  ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' 
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <span>← Back</span>
            </button>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isLight
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-700 text-white hover:bg-red-800'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container py-12 pointer-events-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Support Tickets Management</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Ticket ID</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Subject</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Customer</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 text-slate-900">#TKT001</td>
                <td className="py-4 px-6 text-slate-600">Setup help needed</td>
                <td className="py-4 px-6 text-slate-900">John Doe</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    Open
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Reply
                  </button>
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 text-slate-900">#TKT002</td>
                <td className="py-4 px-6 text-slate-600">Deployment issue</td>
                <td className="py-4 px-6 text-slate-900">Jane Smith</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Resolved
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                    Close
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
