import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminAnalytics() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
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
        // Fetch orders
        const ordersRes = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const orders = ordersRes.data.data || []
        setTotalOrders(orders.length)

        // Calculate total revenue from orders
        const revenue = orders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
        setTotalRevenue(revenue)

        // Calculate average order value
        const avg = orders.length > 0 ? revenue / orders.length : 0
        setAvgOrderValue(avg)

        // Get top projects by purchase count
        const projectStats: { [key: string]: any } = {}
        orders.forEach((order: any) => {
          const projectTitle = order.project_title || 'Unknown Project'
          if (!projectStats[order.project_id]) {
            projectStats[order.project_id] = {
              title: projectTitle,
              count: 0,
              revenue: 0
            }
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className={`border-b transition-all duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="container max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Analytics</h1>
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

      <div className="container py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Analytics Dashboard</h2>
        
        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Total Orders</h3>
            <p className="text-4xl font-bold text-purple-600">{totalOrders}</p>
            <p className="text-slate-500 text-sm mt-2">{totalOrders > 0 ? 'Orders placed' : 'No data yet'}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold text-blue-600">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-slate-500 text-sm mt-2">{totalRevenue > 0 ? 'Revenue generated' : 'No data yet'}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Avg Order Value</h3>
            <p className="text-4xl font-bold text-green-600">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-slate-500 text-sm mt-2">{avgOrderValue > 0 ? 'Per order' : 'No data yet'}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Order Rate</h3>
            <p className="text-4xl font-bold text-yellow-600">{totalOrders}</p>
            <p className="text-slate-500 text-sm mt-2">Total transactions</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Projects */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Top Projects</h3>
            {topProjects.length > 0 ? (
              <div className="space-y-4">
                {topProjects.map((project: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-200 last:border-b-0">
                    <div>
                      <p className="font-semibold text-slate-900">{idx + 1}. {project.title}</p>
                      <p className="text-sm text-slate-500">{project.count} {project.count === 1 ? 'purchase' : 'purchases'}</p>
                    </div>
                    <p className="font-bold text-green-600">₹{project.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No project sales data yet. Projects sold will appear here.</p>
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Order Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <p className="text-slate-600">Total Orders</p>
                <p className="font-bold text-purple-600">{totalOrders}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <p className="text-slate-600">Total Revenue</p>
                <p className="font-bold text-blue-600">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <p className="text-slate-600">Avg Per Order</p>
                <p className="font-bold text-green-600">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-slate-600">Best Period</p>
                <p className="font-bold text-yellow-600">This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
