import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const userRole = localStorage.getItem('userRole')
  const userName = localStorage.getItem('userName')
  
  const [projectCount, setProjectCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Redirect if not admin
  if (userRole !== 'admin') {
    window.location.href = '/auth/login'
    return null
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      // Fetch projects
      const projectsRes = await axios.get('http://localhost:5000/api/projects')
      const projects = projectsRes.data.data || []
      setProjectCount(projects.length)
      console.log('Projects:', projects.length)

      // Fetch users
      try {
        const token = localStorage.getItem('token')
        const userRole = localStorage.getItem('userRole')
        console.log('Fetching users - Token:', !!token, 'Role:', userRole)
        
        const usersRes = await axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('Users response full:', usersRes.data)
        
        const users = usersRes.data.data || usersRes.data.users || []
        const userLength = Array.isArray(users) ? users.length : 0
        setUserCount(userLength)
        console.log('Users count:', userLength)
      } catch (userErr: any) {
        console.error('Users fetch error:', {
          status: userErr.response?.status,
          error: userErr.response?.data?.error,
          message: userErr.message
        })
        setUserCount(0)
      }

      // Fetch orders
      const ordersRes = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const orders = ordersRes.data.data || []
      setOrderCount(orders.length)

      // Amount is already in rupees (orders.js divides paise by 100 in SQL)
      const revenue = orders.reduce((sum: number, order: any) => sum + (Number(order.amount) || 0), 0)
      setTotalRevenue(Math.round(revenue))
      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    window.location.href = '/auth/login'
  }

  return (
    <div className={`min-h-screen transition-all duration-300 w-full pointer-events-none ${isLight ? 'bg-transparent text-slate-900' : 'bg-transparent text-white'}`}>
      {/* Admin Header */}
      <div className={`border-b backdrop-blur-md transition-all duration-300 pointer-events-auto ${isLight ? 'bg-white/50 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Admin Dashboard</h1>
            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Welcome back, {userName}!</p>
          </div>
          <div className="flex gap-4 items-center">
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
              onClick={() => window.location.reload()}
              disabled={refreshing}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                refreshing
                  ? 'opacity-50 cursor-not-allowed'
                  : isLight
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/60'
              }`}
              title="Reload page and refresh all dashboard stats"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              Refresh Stats
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold transition-all bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>Loading dashboard data...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8 pointer-events-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg p-6 shadow-sm border-t-4 border-red-500 transition-all ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>TOTAL PROJECTS</p>
                <p className={`text-3xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{projectCount}</p>
                <p className={`text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>+12% from last month</p>
              </div>
              <span className="text-3xl">📦</span>
            </div>
          </div>

          <div className={`rounded-lg p-6 shadow-sm border-t-4 border-blue-500 transition-all ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>TOTAL USERS</p>
                <p className={`text-3xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{userCount}</p>
                <p className={`text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Elastic</p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </div>

          <div className={`rounded-lg p-6 shadow-sm border-t-4 border-purple-500 transition-all ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>TOTAL ORDERS</p>
                <p className={`text-3xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{orderCount}</p>
                <p className={`text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>New</p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>

          <div className={`rounded-lg p-6 shadow-sm border-t-4 border-yellow-500 transition-all ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>REVENUE</p>
                <p className={`text-3xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>₹{totalRevenue.toLocaleString()}</p>
                <p className={`text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Total 0%</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={() => navigate('/admin/users')}
              className={`p-4 rounded-lg text-center hover:shadow-md transition-all ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <p className="text-2xl mb-2">👥</p>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Manage Users</p>
            </button>

            <button
              onClick={() => navigate('/admin/projects')}
              className={`p-4 rounded-lg text-center hover:shadow-md transition-all ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <p className="text-2xl mb-2">📦</p>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Manage Projects</p>
            </button>

            <button
              onClick={() => navigate('/admin/projects/create')}
              className={`p-4 rounded-lg text-center hover:shadow-md transition-all ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <p className="text-2xl mb-2">➕</p>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Create Project</p>
            </button>

            <button
              onClick={() => navigate('/admin/orders')}
              className={`p-4 rounded-lg text-center hover:shadow-md transition-all ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <p className="text-2xl mb-2">📋</p>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>View Orders</p>
            </button>

            <button
              onClick={() => navigate('/admin/support')}
              className={`p-4 rounded-lg text-center hover:shadow-md transition-all ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <p className="text-2xl mb-2">💬</p>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Support</p>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className={`p-4 rounded-lg text-center hover:shadow-md transition-all ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <p className="text-2xl mb-2">📊</p>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Analytics</p>
            </button>

            <button
              onClick={() => navigate('/admin/custom-projects')}
              className={`p-4 rounded-lg text-center hover:shadow-md transition-all relative ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <p className="text-2xl mb-2">📝</p>
              <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Custom</p>
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
            </button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className={`rounded-lg shadow-sm p-6 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Recent Orders</h2>
            <div className="flex gap-2">
              <button className={`px-3 py-1 text-sm rounded transition-all ${isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-700'}`}>
                ⬇️
              </button>
              <button className={`px-3 py-1 text-sm rounded transition-all ${isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-700'}`}>
                ↑↓
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                  <th className={`text-left py-3 px-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>ORDER ID</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>CUSTOMER</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>PROJECT</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>AMOUNT</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>STATUS</th>
                  <th className={`text-left py-3 px-4 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`py-8 text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      No recent orders yet. Data will appear here when orders are placed.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any, idx: number) => (
                    <tr key={order.id} className={`border-b transition-all ${isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-700 hover:bg-slate-700'}`}>
                      <td className={`py-3 px-4 font-semibold text-blue-600`}>ORD-{String(idx + 1).padStart(4, '0')}</td>
                      <td className={`py-3 px-4 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                            {(order.name || order.email)[0]}
                          </div>
                          <span>{order.name || order.email}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>{order.project_title || 'N/A'}</td>
                      <td className={`py-3 px-4 font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>₹{Math.round(Number(order.amount) || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isLight ? 'bg-green-100 text-green-700' : 'bg-green-900 text-green-200'}`}>
                          COMPLETED
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className={`px-2 py-1 ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'}`}>
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {recentOrders.length > 0 && (
            <div className="mt-4 text-center border-t pt-4">
              <button
                onClick={() => navigate('/admin/orders')}
                className={`font-semibold transition-all ${isLight ? 'text-purple-600 hover:text-purple-700' : 'text-purple-400 hover:text-purple-300'}`}
              >
                View All {orderCount} Orders
              </button>
            </div>
          )}
        </div>
      </div>
        </>
      )}

    </div>
  )
}
