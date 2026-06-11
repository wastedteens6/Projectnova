import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dk = theme !== 'light'
  
  const token = localStorage.getItem('token')
  const userName = localStorage.getItem('userName')
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

  const [projectCount, setProjectCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [supportTickets, setSupportTickets] = useState([
    { id: 'TKT001', user: 'Abhishek G.', subject: 'Payment Failed', status: 'OPEN', priority: 'HIGH' },
    { id: 'TKT002', user: 'Sneha R.', subject: 'Project Access', status: 'PENDING', priority: 'MEDIUM' },
    { id: 'TKT003', user: 'Rahul M.', subject: 'Custom Project Info', status: 'CLOSED', priority: 'LOW' },
  ])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const projectsRes = await axios.get('${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/projects')
      setProjectCount(projectsRes.data.data?.length || 0)

      try {
        const usersRes = await axios.get('${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const users = usersRes.data.data || usersRes.data.users || []
        setUserCount(Array.isArray(users) ? users.length : 0)
      } catch { setUserCount(0) }

      const ordersRes = await axios.get('${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const orders = ordersRes.data.data || []
      setOrderCount(orders.length)
      const revenue = orders.reduce((sum: number, order: any) => sum + (Number(order.amount) || 0), 0)
      setTotalRevenue(Math.round(revenue))
      setRecentOrders(orders.slice(0, 5))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

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
            <h1 className="text-lg font-bold whitespace-nowrap">Admin Dashboard</h1>
            <span className={`text-xs font-medium ${muted}`}>Welcome back, {userName}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >← Back</button>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              } disabled:opacity-40`}
            >
              <span className={refreshing ? 'animate-spin inline-block' : ''}>↻</span> Refresh
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center pointer-events-auto">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className={`text-xs ${muted}`}>Loading dashboard…</span>
        </div>
      ) : (
        <div className="max-w-screen-xl mx-auto px-6 py-6 pointer-events-auto flex flex-col gap-6">
          
          {/* ── Compact Stat Cards ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-xl border p-4 flex items-center gap-4 transition-all duration-300 ${cardBg}`}>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-xl">📦</div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Total Projects</p>
                <p className="text-xl font-black">{projectCount}</p>
              </div>
            </div>
            <div className={`rounded-xl border p-4 flex items-center gap-4 transition-all duration-300 ${cardBg}`}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">👥</div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Total Users</p>
                <p className="text-xl font-black">{userCount}</p>
              </div>
            </div>
            <div className={`rounded-xl border p-4 flex items-center gap-4 transition-all duration-300 ${cardBg}`}>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl">📋</div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Total Orders</p>
                <p className="text-xl font-black">{orderCount}</p>
              </div>
            </div>
            <div className={`rounded-xl border p-4 flex items-center gap-4 transition-all duration-300 ${cardBg}`}>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center text-xl">💰</div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Revenue</p>
                <p className="text-xl font-black">₹{Number(totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>

          {/* ── Grid: Orders (Left) & Support (Right) ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Orders */}
            <div className={`lg:col-span-2 rounded-xl border overflow-hidden flex flex-col ${cardBg}`}>
              <div className={`px-5 py-3 border-b ${border} flex justify-between items-center`}>
                <h2 className="text-sm font-bold">Recent Orders</h2>
                <button onClick={() => navigate('/admin/orders')} className={`text-[10px] font-bold text-purple-500 hover:text-purple-400`}>View All →</button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={`border-b ${border} ${headBg}`}>
                      <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Order</th>
                      <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Customer</th>
                      <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Amount</th>
                      <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr><td colSpan={4} className={`py-8 text-center text-[10px] ${muted}`}>No recent orders</td></tr>
                    ) : recentOrders.map((order: any, idx: number) => (
                      <tr key={order.id} className={`border-b ${border} ${dk ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                        <td className="px-4 py-3 font-mono text-[10px] text-blue-500 font-bold">ORD-{String(idx + 1).padStart(4, '0')}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-purple-500 text-white">
                              {(order.name || order.email)[0].toUpperCase()}
                            </span>
                            <span className="font-medium">{order.name || order.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold">₹{Math.round(Number(order.amount) || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/15 text-green-500">PAID</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Support Tickets */}
            <div className={`rounded-xl border flex flex-col ${cardBg}`}>
              <div className={`px-5 py-3 border-b ${border} flex justify-between items-center`}>
                <h2 className="text-sm font-bold">Support</h2>
                <button onClick={() => navigate('/admin/support')} className={`text-[10px] font-bold text-emerald-500 hover:text-emerald-400`}>Tickets →</button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {supportTickets.map(ticket => (
                  <div key={ticket.id} className={`p-3 rounded-lg border transition-colors cursor-pointer ${dk ? 'border-slate-700/50 hover:border-emerald-500/30 bg-slate-800/30' : 'border-slate-200 hover:border-emerald-300 bg-slate-50'}`} onClick={() => navigate('/admin/support')}>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-500">{ticket.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        ticket.priority === 'HIGH' ? 'bg-red-500/15 text-red-500' : 
                        ticket.priority === 'MEDIUM' ? 'bg-orange-500/15 text-orange-500' : 'bg-blue-500/15 text-blue-500'
                      }`}>{ticket.priority}</span>
                    </div>
                    <p className="font-semibold text-xs mb-1 truncate">{ticket.subject}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] ${muted}`}>{ticket.user}</span>
                      <span className={`text-[9px] font-bold ${
                        ticket.status === 'OPEN' ? 'text-emerald-500' : 
                        ticket.status === 'PENDING' ? 'text-orange-400' : muted
                      }`}>{ticket.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
