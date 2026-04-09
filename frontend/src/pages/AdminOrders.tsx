import React from 'react'

export default function AdminOrders() {
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-900 text-white shadow-lg">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Manage Orders</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Orders Management</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Order ID</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Customer</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Project</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Amount</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 text-slate-900">#ORD001</td>
                <td className="py-4 px-6 text-slate-900">John Doe</td>
                <td className="py-4 px-6 text-slate-600">MERN E-Commerce</td>
                <td className="py-4 px-6 text-slate-600">₹1,999</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Completed
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600">2026-04-01</td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6 text-slate-900">#ORD002</td>
                <td className="py-4 px-6 text-slate-900">Jane Smith</td>
                <td className="py-4 px-6 text-slate-600">Django Blog</td>
                <td className="py-4 px-6 text-slate-600">₹999</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    Pending
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600">2026-04-05</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
