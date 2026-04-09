import React from 'react'

export default function AdminAnalytics() {
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-900 text-white shadow-lg">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Analytics Dashboard</h2>
        
        {/* Analytics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Total Views</h3>
            <p className="text-4xl font-bold text-purple-600">15.2K</p>
            <p className="text-slate-500 text-sm mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Conversion Rate</h3>
            <p className="text-4xl font-bold text-blue-600">3.2%</p>
            <p className="text-slate-500 text-sm mt-2">↑ 0.5% from last month</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold text-green-600">₹5.2L</p>
            <p className="text-slate-500 text-sm mt-2">↑ 23% from last month</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-600">
            <h3 className="text-slate-600 text-sm font-semibold mb-2">Avg Order Value</h3>
            <p className="text-4xl font-bold text-yellow-600">₹1,520</p>
            <p className="text-slate-500 text-sm mt-2">↑ 8% from last month</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Projects */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Top Projects</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700">MERN E-Commerce</span>
                <span className="text-slate-600 font-semibold">234 sales</span>
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700">Django Blog</span>
                <span className="text-slate-600 font-semibold">156 sales</span>
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700">React Dashboard</span>
                <span className="text-slate-600 font-semibold">123 sales</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-700">Vue.js App</span>
                <span className="text-slate-600 font-semibold">98 sales</span>
              </li>
            </ul>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Traffic Sources</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700">Direct</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-purple-200 rounded-full">
                    <div className="w-16 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                  <span className="text-slate-600 font-semibold">45%</span>
                </div>
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700">Google</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-blue-200 rounded-full">
                    <div className="w-20 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-slate-600 font-semibold">32%</span>
                </div>
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700">Social</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-green-200 rounded-full">
                    <div className="w-12 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-slate-600 font-semibold">15%</span>
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-700">Other</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-yellow-200 rounded-full">
                    <div className="w-6 h-2 bg-yellow-600 rounded-full"></div>
                  </div>
                  <span className="text-slate-600 font-semibold">8%</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
