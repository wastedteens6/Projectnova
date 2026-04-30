import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminSupport() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dk = theme !== 'light'
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const headBg   = dk ? 'bg-slate-900/50'                 : 'bg-slate-50/50'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'

  return (
    <div className={`min-h-screen pointer-events-none ${surface}`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">Support Tickets</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>Manage customer inquiries</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >← Back</button>
        </div>
      </header>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 pointer-events-auto">
        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className={`border-b ${border} ${headBg}`}>
                <tr>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Ticket ID</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Subject</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Customer</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Status</th>
                  <th className={`px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${border} ${dk ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className="px-4 py-3 font-mono text-[10px] text-blue-500 font-bold">#TKT001</td>
                  <td className={`px-4 py-3 font-medium ${dk ? 'text-slate-300' : 'text-slate-700'}`}>Setup help needed</td>
                  <td className="px-4 py-3 font-medium">John Doe</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      dk ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      Open
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={`px-2 py-1 rounded border text-[10px] font-medium transition ${
                      dk ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10' : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                    }`}>
                      Reply
                    </button>
                  </td>
                </tr>
                <tr className={`border-b ${border} ${dk ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className="px-4 py-3 font-mono text-[10px] text-blue-500 font-bold">#TKT002</td>
                  <td className={`px-4 py-3 font-medium ${dk ? 'text-slate-300' : 'text-slate-700'}`}>Deployment issue</td>
                  <td className="px-4 py-3 font-medium">Jane Smith</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      dk ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      Resolved
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={`px-2 py-1 rounded border text-[10px] font-medium transition ${
                      dk ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}>
                      Close
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
