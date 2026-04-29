import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminOrders() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRes = await axios.get('http://localhost:5000/api/orders', {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-transparent pointer-events-none">
      <header className={`border-b transition-all duration-300 pointer-events-auto ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="container max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Manage Orders</h1>
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
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Orders Management</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Order ID</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Customer</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Project</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Tier</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Amount</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-slate-500">
                    No orders yet. Data will appear here when orders are placed.
                  </td>
                </tr>
              ) : (
                orders.map((order: any, idx: number) => (
                  <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="py-4 px-6 text-slate-900 font-mono text-sm">{idx + 1}</td>
                    <td className="py-4 px-6 text-slate-900">{order.name || order.email}</td>
                    <td className="py-4 px-6 text-slate-900">{order.project_title || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-900">{order.tier_name} (Lvl {order.tier_level})</td>
                    <td className="py-4 px-6 text-slate-900 font-semibold text-green-600">₹{order.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
