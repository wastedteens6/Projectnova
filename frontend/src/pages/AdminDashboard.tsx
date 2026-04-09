import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const userRole = localStorage.getItem('userRole')
  
  // Redirect if not admin
  if (userRole !== 'admin') {
    window.location.href = '/auth/login'
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  const [projectCount, setProjectCount] = React.useState(0)
  const [globalPrices, setGlobalPrices] = React.useState({ tier1: '499', tier2: '999', tier3: '1999' })
  const [savingPrices, setSavingPrices] = React.useState(false)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const projectsRes = await fetch('http://localhost:5000/api/admin/projects/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await projectsRes.json()
        if (data.success) {
          setProjectCount(data.data.length || 0)
        }

        const settingsRes = await fetch('http://localhost:5000/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const settingsData = await settingsRes.json()
        if (settingsData.success && settingsData.data) {
          setGlobalPrices({
            tier1: settingsData.data.tier1?.toString() || '499',
            tier2: settingsData.data.tier2?.toString() || '999',
            tier3: settingsData.data.tier3?.toString() || '1999'
          })
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err)
      }
    }
    fetchStats()
  }, [])

  const handleSavePrices = async () => {
    setSavingPrices(true)
    try {
      const token = localStorage.getItem('token')
      await fetch('http://localhost:5000/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          tier1: Number(globalPrices.tier1) || 0,
          tier2: Number(globalPrices.tier2) || 0,
          tier3: Number(globalPrices.tier3) || 0
        })
      })
      alert('Global pricing saved successfully and applied to all projects!')
    } catch(e) {
      alert('Failed to save prices.')
    } finally {
      setSavingPrices(false)
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
      {/* Admin Header */}
      <header className={`transition-all duration-300 ${isLight ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white'} shadow-lg`}>
        <div className="container flex items-center justify-between h-16">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className={`text-sm transition-all duration-300 ${isLight ? 'text-purple-200' : 'text-cyan-200'}`}>Manage WastedTeens☠️</p>
          </div>
          <button
            onClick={handleLogout}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${isLight ? 'bg-purple-500 hover:bg-purple-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Content */}
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className={`rounded-lg p-6 shadow-md border-l-4 transition-all duration-300 ${isLight ? 'bg-white border-red-600' : 'bg-slate-900 border-red-500'}`}>
            <h3 className={`text-sm font-semibold mb-2 transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Projects</h3>
            <p className={`text-4xl font-bold transition-all duration-300 ${isLight ? 'text-red-600' : 'text-red-400'}`}>{projectCount}</p>
          </div>
          <div className={`rounded-lg p-6 shadow-md border-l-4 transition-all duration-300 ${isLight ? 'bg-white border-blue-600' : 'bg-slate-900 border-blue-500'}`}>
            <h3 className={`text-sm font-semibold mb-2 transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Users</h3>
            <p className={`text-4xl font-bold transition-all duration-300 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>0</p>
          </div>
          <div className={`rounded-lg p-6 shadow-md border-l-4 transition-all duration-300 ${isLight ? 'bg-white border-green-600' : 'bg-slate-900 border-green-500'}`}>
            <h3 className={`text-sm font-semibold mb-2 transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Orders</h3>
            <p className={`text-4xl font-bold transition-all duration-300 ${isLight ? 'text-green-600' : 'text-green-400'}`}>0</p>
          </div>
          <div className={`rounded-lg p-6 shadow-md border-l-4 transition-all duration-300 ${isLight ? 'bg-white border-yellow-600' : 'bg-slate-900 border-yellow-500'}`}>
            <h3 className={`text-sm font-semibold mb-2 transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Revenue</h3>
            <p className={`text-4xl font-bold transition-all duration-300 ${isLight ? 'text-yellow-600' : 'text-yellow-400'}`}>₹0</p>
          </div>
        </div>

        {/* Global Pricing Settings - MOVED TO TOP */}
        <div className={`mb-12 rounded-lg shadow-md p-6 transition-all duration-300 ${isLight ? 'bg-white border-2 border-purple-200' : 'bg-slate-900 border-2 border-cyan-800'}`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-2xl font-bold transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>Global Tier Pricing</h2>
              <p className={`text-sm mt-1 mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Set base prices for tiers to automatically override across ALL published projects instantaneously.</p>
            </div>
            <button 
              onClick={handleSavePrices} 
              disabled={savingPrices}
              className={`px-6 py-2 rounded-lg font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 ${isLight ? 'bg-purple-600 hover:bg-purple-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
            >
              {savingPrices ? 'Saving...' : '💾 Save Global Prices'}
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
              <label className={`block font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Tier 1 (Basic)</label>
              <div className="flex items-center">
                <span className="text-xl font-bold mr-2 text-slate-500">₹</span>
                <input 
                  type="number" 
                  value={globalPrices.tier1} 
                  onChange={e => setGlobalPrices(prev => ({...prev, tier1: e.target.value}))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${isLight ? 'border-slate-300 focus:border-purple-600' : 'border-slate-600 bg-slate-900 focus:border-cyan-500'}`}
                />
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
              <label className={`block font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Tier 2 (Standard)</label>
              <div className="flex items-center">
                <span className="text-xl font-bold mr-2 text-slate-500">₹</span>
                <input 
                  type="number" 
                  value={globalPrices.tier2} 
                  onChange={e => setGlobalPrices(prev => ({...prev, tier2: e.target.value}))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${isLight ? 'border-slate-300 focus:border-purple-600' : 'border-slate-600 bg-slate-900 focus:border-cyan-500'}`}
                />
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
              <label className={`block font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Tier 3 (Premium)</label>
              <div className="flex items-center">
                <span className="text-xl font-bold mr-2 text-slate-500">₹</span>
                <input 
                  type="number" 
                  value={globalPrices.tier3} 
                  onChange={e => setGlobalPrices(prev => ({...prev, tier3: e.target.value}))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${isLight ? 'border-slate-300 focus:border-purple-600' : 'border-slate-600 bg-slate-900 focus:border-cyan-500'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Menu */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/admin/users')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left ${isLight ? 'bg-white text-slate-900 border-red-600' : 'bg-slate-900 text-white border-red-500'}`}
          >
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>👥 Manage Users</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>View, edit, and manage user accounts</p>
          </button>

          <button 
            onClick={() => navigate('/admin/projects')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left ${isLight ? 'bg-white text-slate-900 border-blue-600' : 'bg-slate-900 text-white border-blue-500'}`}
          >
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>📦 Manage Projects</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Add, edit, and delete projects</p>
          </button>

          <button 
            onClick={() => navigate('/admin/projects/create')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left ${isLight ? 'bg-white text-slate-900 border-cyan-600' : 'bg-slate-900 text-white border-cyan-500'}`}
          >
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>➕ Create Project</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Add a new project to the platform</p>
          </button>

          <button 
            onClick={() => navigate('/admin/orders')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left ${isLight ? 'bg-white text-slate-900 border-green-600' : 'bg-slate-900 text-white border-green-500'}`}
          >
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>📋 View Orders</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Manage customer orders and payments</p>
          </button>

          <button 
            onClick={() => navigate('/admin/support')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left ${isLight ? 'bg-white text-slate-900 border-yellow-600' : 'bg-slate-900 text-white border-yellow-500'}`}
          >
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>💬 Support Tickets</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Respond to customer support tickets</p>
          </button>

          <button 
            onClick={() => navigate('/admin/analytics')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left ${isLight ? 'bg-white text-slate-900 border-pink-600' : 'bg-slate-900 text-white border-pink-500'}`}
          >
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>📊 Analytics</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>View sales and traffic analytics</p>
          </button>

          <button 
            onClick={() => navigate('/admin/settings')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left ${isLight ? 'bg-white text-slate-900 border-indigo-600' : 'bg-slate-900 text-white border-indigo-500'}`}
          >
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>⚙️ Settings</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Configure system settings</p>
          </button>

          <button 
            onClick={() => navigate('/admin/custom-projects')} 
            className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 text-left relative ${isLight ? 'bg-white text-slate-900 border-orange-600' : 'bg-slate-900 text-white border-orange-500'}`}
          >
            <div className="absolute top-3 right-3">
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${isLight ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white'}`}>
                ⭐ NEW
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>📝 Custom Projects</h3>
            <p className={`transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Review user custom project requests</p>
          </button>
        </div>

        {/* Recent Orders */}
        <div className={`mt-12 rounded-lg shadow-md p-6 transition-all duration-300 ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
          <h2 className={`text-2xl font-bold mb-6 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>Recent Orders</h2>
          <table className="w-full">
            <thead className={`border-b-2 transition-all duration-300 ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
              <tr>
                <th className={`text-left py-3 font-semibold transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Order ID</th>
                <th className={`text-left py-3 font-semibold transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Customer</th>
                <th className={`text-left py-3 font-semibold transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Project</th>
                <th className={`text-left py-3 font-semibold transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Amount</th>
                <th className={`text-left py-3 font-semibold transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className={`py-8 text-center transition-all duration-300 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  No orders found
                </td>
              </tr>
            </tbody>
          </table>
        </div>


      </div>
    </div>
  )
}
