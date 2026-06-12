import api from '../lib/api';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dk = theme !== 'light'
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [avgOrderValue, setAvgOrderValue] = useState(0)
  const [topProjects, setTopProjects] = useState<any[]>([])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const ordersRes = await api.get('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const orders = ordersRes.data.data || []
        setTotalOrders(orders.length)

        const revenue = orders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
        setTotalRevenue(revenue)

        const avg = orders.length > 0 ? revenue / orders.length : 0
        setAvgOrderValue(avg)

        const projectStats: { [key: string]: any } = {}
        orders.forEach((order: any) => {
          const projectTitle = order.project_title || 'Unknown Project'
          if (!projectStats[order.project_id]) {
            projectStats[order.project_id] = { title: projectTitle, count: 0, revenue: 0 }
          }
          projectStats[order.project_id].count += 1
          projectStats[order.project_id].revenue += order.amount || 0
        })

        const topProjectsList = Object.values(projectStats)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5)
        setTopProjects(topProjectsList)
      } catch (err) {
        console.error('Error fetching analytics data:', err)
      }
    }

    fetchAnalyticsData()
  }, [])

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'

  return (
    <div className={`min-h-screen pointer-events-none ${surface}`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">Analytics</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>Performance Overview</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >← Back</button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 pointer-events-auto flex flex-col gap-6">
        
        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-sm border-l-2 border-l-purple-500 transition-all ${cardBg}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Total Orders</h3>
            <p className="text-2xl font-bold text-purple-500">{totalOrders}</p>
            <p className={`text-[10px] mt-1 ${muted}`}>{totalOrders > 0 ? 'Orders placed' : 'No data yet'}</p>
          </div>
          <div className={`rounded-xl p-4 shadow-sm border-l-2 border-l-blue-500 transition-all ${cardBg}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Total Revenue</h3>
            <p className="text-2xl font-bold text-blue-500">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className={`text-[10px] mt-1 ${muted}`}>{totalRevenue > 0 ? 'Revenue generated' : 'No data yet'}</p>
          </div>
          <div className={`rounded-xl p-4 shadow-sm border-l-2 border-l-emerald-500 transition-all ${cardBg}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Avg Order Value</h3>
            <p className="text-2xl font-bold text-emerald-500">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className={`text-[10px] mt-1 ${muted}`}>{avgOrderValue > 0 ? 'Per order' : 'No data yet'}</p>
          </div>
          <div className={`rounded-xl p-4 shadow-sm border-l-2 border-l-amber-500 transition-all ${cardBg}`}>
            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Order Rate</h3>
            <p className="text-2xl font-bold text-amber-500">{totalOrders}</p>
            <p className={`text-[10px] mt-1 ${muted}`}>Total transactions</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Top Projects */}
          <div className={`rounded-xl p-5 border transition-all flex flex-col gap-4 ${cardBg}`}>
            <h3 className="text-sm font-bold">Top Projects</h3>
            {topProjects.length > 0 ? (
              <div className="flex flex-col gap-2">
                {topProjects.map((project: any, idx: number) => (
                  <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border ${dk ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div>
                      <p className="font-bold text-xs">{idx + 1}. {project.title}</p>
                      <p className={`text-[10px] mt-0.5 ${muted}`}>{project.count} {project.count === 1 ? 'purchase' : 'purchases'}</p>
                    </div>
                    <p className="font-bold text-xs text-emerald-500">₹{project.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 text-xs ${muted}`}>
                <p>No project sales data yet. Projects sold will appear here.</p>
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className={`rounded-xl p-5 border transition-all flex flex-col gap-4 ${cardBg}`}>
            <h3 className="text-sm font-bold">Order Statistics</h3>
            <div className="flex flex-col gap-2">
              <div className={`flex justify-between items-center p-3 rounded-lg border ${dk ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-semibold ${muted}`}>Total Orders</p>
                <p className="font-bold text-xs text-purple-500">{totalOrders}</p>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg border ${dk ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-semibold ${muted}`}>Total Revenue</p>
                <p className="font-bold text-xs text-blue-500">₹{Number(totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg border ${dk ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-semibold ${muted}`}>Avg Per Order</p>
                <p className="font-bold text-xs text-emerald-500">₹{Number(avgOrderValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg border ${dk ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-semibold ${muted}`}>Best Period</p>
                <p className="font-bold text-xs text-amber-500">This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
