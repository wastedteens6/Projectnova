'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Purchase {
  transactionId: string
  userId: string
  userName: string
  userEmail: string
  projectId: string
  projectTitle: string
  slug: string
  tier: string
  price: number
  orderId: string
  purchaseDate: string
  purchasedAt: string
}

export default function AdminPurchases() {
  const { theme } = useTheme()
  const dk = theme !== 'light'
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterEmail, setFilterEmail] = useState('')
  const [filterProject, setFilterProject] = useState('')

  const fetchPurchases = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get('http://localhost:5000/api/admin/purchases', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        setPurchases(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [])

  const filteredPurchases = purchases.filter(p => {
    const emailMatch = p.userEmail.toLowerCase().includes(filterEmail.toLowerCase())
    const projectMatch = p.projectTitle.toLowerCase().includes(filterProject.toLowerCase())
    return emailMatch && projectMatch
  })

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const headBg   = dk ? 'bg-slate-900/50'                 : 'bg-slate-50/50'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'
  const inputBg  = dk ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-400'

  return (
    <div className={`min-h-screen pointer-events-none ${surface}`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">Manage Purchases</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>{purchases.length} Total</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >← Back</button>
            <button
              onClick={fetchPurchases}
              disabled={refreshing}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                refreshing ? 'opacity-50' : dk ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 pointer-events-auto">
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Filter by email..."
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-md border outline-none transition w-60 ${inputBg}`}
          />
          <input
            type="text"
            placeholder="Filter by project..."
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-md border outline-none transition w-60 ${inputBg}`}
          />
        </div>

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className={`border-b ${border} ${headBg}`}>
                <tr>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>User</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Project</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Tier</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Price</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className={`py-16 text-center text-xs ${muted}`}>Loading purchases…</td></tr>
                ) : filteredPurchases.length === 0 ? (
                  <tr><td colSpan={5} className={`py-16 text-center text-xs ${muted}`}>No purchases found</td></tr>
                ) : (
                  filteredPurchases.map((purchase, idx) => (
                    <tr key={idx} className={`border-b ${border} ${dk ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="font-bold">{purchase.userName}</div>
                        <div className={`text-[10px] ${muted}`}>{purchase.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{purchase.projectTitle}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          dk ? 'bg-slate-800/50 text-slate-300 border border-slate-700/50' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {purchase.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-500">₹{Number(purchase.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className={`px-4 py-3 text-[10px] ${muted}`}>{purchase.purchaseDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
