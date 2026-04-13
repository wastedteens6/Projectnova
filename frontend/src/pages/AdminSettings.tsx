import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AdminSettings() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  const [settings, setSettings] = React.useState({
    siteName: 'WastedTeens☠️',
    siteEmail: 'admin@wastedteens.com',
    currency: 'INR',
    taxRate: '18',
    maintenanceMode: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className={`border-b transition-all duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="container max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Settings</h1>
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
        <h2 className="text-3xl font-bold text-slate-900 mb-8">System Settings</h2>
        
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-900">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-900">Site Email</label>
              <input
                type="email"
                name="siteEmail"
                value={settings.siteEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-900">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>INR</option>
                <option>GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-900">Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenance"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="maintenance" className="ml-3 text-sm font-semibold text-slate-900">
                Enable Maintenance Mode
              </label>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Save Settings
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
