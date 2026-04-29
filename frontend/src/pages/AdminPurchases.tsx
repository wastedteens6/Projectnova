'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Purchase {
  transactionId: string
  userId: string
  userName: string
  userEmail: string
  projectId: string
  projectTitle: string
  slug: string
  tier: string
  price: number
  orderId: string
  purchaseDate: string
  purchasedAt: string
}

export default function AdminPurchases() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterEmail, setFilterEmail] = useState('')
  const [filterProject, setFilterProject] = useState('')

  // Redirect if not admin
  if (userRole !== 'admin') {
    window.location.href = '/auth/login'
    return null
  }

  const fetchPurchases = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get('http://localhost:5000/api/admin/purchases', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        setPurchases(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    if (token && userRole === 'admin') {
      fetchPurchases()
    }
  }, [token, userRole])

  const filteredPurchases = purchases.filter(p => {
    const emailMatch = p.userEmail.toLowerCase().includes(filterEmail.toLowerCase())
    const projectMatch = p.projectTitle.toLowerCase().includes(filterProject.toLowerCase())
    return emailMatch && projectMatch
  })

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 pointer-events-none ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-7xl mx-auto pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              All Purchases
            </h1>
            <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Total purchases: {purchases.length}
            </p>
          </div>
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
              onClick={() => window.location.reload()}
              disabled={refreshing}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                refreshing
                  ? 'opacity-50 cursor-not-allowed'
                  : isLight
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/60'
              }`}
              title="Reload page and refresh purchases"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <input
            type="text"
            placeholder="Filter by user email..."
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isLight
                ? 'border-slate-300 bg-white text-slate-900'
                : 'border-slate-700 bg-slate-800 text-white'
            }`}
          />
          <input
            type="text"
            placeholder="Filter by project..."
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isLight
                ? 'border-slate-300 bg-white text-slate-900'
                : 'border-slate-700 bg-slate-800 text-white'
            }`}
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>Loading purchases...</p>
            </div>
          </div>
        ) : (
          /* Table */
          <div className={`rounded-lg overflow-hidden border ${
            isLight
              ? 'border-slate-200 bg-white'
              : 'border-slate-700 bg-slate-800'
          }`}>
            <table className="w-full">
              <thead>
                <tr className={`${
                  isLight
                    ? 'bg-slate-100 border-b border-slate-200'
                    : 'bg-slate-900 border-b border-slate-700'
                }`}>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>User</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Project</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Tier</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Price</th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-6 py-8 text-center ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${
                        isLight
                          ? 'border-slate-200 hover:bg-slate-50'
                          : 'border-slate-700 hover:bg-slate-700/50'
                      }`}
                    >
                      <td className={`px-6 py-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <div>
                          <p className="font-semibold">{purchase.userName}</p>
                          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            {purchase.userEmail}
                          </p>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {purchase.projectTitle}
                      </td>
                      <td className={`px-6 py-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {purchase.tier}
                      </td>
                      <td className={`px-6 py-4 font-semibold ${
                        isLight ? 'text-purple-600' : 'text-purple-400'
                      }`}>
                        ₹{purchase.price.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {purchase.purchaseDate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
