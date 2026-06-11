import api from '../lib/api';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminOrders() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dk = theme !== 'light'
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRes = await api.get(/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setOrders(ordersRes.data.data || [])
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const fmtDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
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
            <h1 className="text-lg font-bold whitespace-nowrap">Manage Orders</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>{orders.length} Total</span>
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
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Order ID</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Customer</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Project</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Tier</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Amount</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={`py-16 text-center text-xs ${muted}`}>Loading orders…</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className={`py-16 text-center text-xs ${muted}`}>No orders found</td></tr>
                ) : (
                  orders.map((order: any, idx: number) => (
                    <tr key={order.id} className={`border-b ${border} ${dk ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-4 py-3 font-mono text-[10px] text-blue-500 font-bold">ORD-{String(idx + 1).padStart(4, '0')}</td>
                      <td className="px-4 py-3 font-medium">{order.name || order.email}</td>
                      <td className="px-4 py-3">{order.project_title || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          dk ? 'bg-slate-800/50 text-slate-300 border border-slate-700/50' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {order.tier_name} (Lvl {order.tier_level})
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-500">₹{Number(order.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className={`px-4 py-3 text-[10px] ${muted}`}>{fmtDate(order.created_at)}</td>
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
