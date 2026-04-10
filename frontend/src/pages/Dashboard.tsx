import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

  const [userName, setUserName] = useState('User')
  const [savedProjects, setSavedProjects] = useState<any[]>([])

  const [cartItems, setCartItems] = useState<any[]>([])

  useEffect(() => {
    // Get user name from localStorage
    const storedUserName = localStorage.getItem('userName')
    if (storedUserName) {
      setUserName(storedUserName)
    }

    // Get saved projects from localStorage
    const storedProjects = localStorage.getItem('savedProjects')
    if (storedProjects) {
      try {
        setSavedProjects(JSON.parse(storedProjects))
      } catch (err) {
        console.error('Error parsing saved projects:', err)
      }
    }

    // Get cart items
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch (err) {
        console.error('Error parsing cart:', err)
      }
    }
  }, [])

  const handleRemoveFromCart = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const handleBuyNow = (itemId: string) => {
    // Navigate to checkout with itemId parameter to checkout only this item
    navigate(`/checkout?itemId=${itemId}`)
  }

  const handleCheckoutAll = () => {
    // Navigate to checkout without itemId to checkout all items
    navigate('/checkout')
  }

  // Calculate total spent based on saved projects
  const totalSpent = savedProjects.reduce((acc: number, curr: any) => {
    const priceStr = curr.price?.toString() || '0'
    const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0
    return acc + numericPrice
  }, 0)

  const stats = [
    { label: 'Purchased Projects', value: savedProjects.length.toString(), icon: '📦', color: 'from-purple-600 to-pink-600' },
    { label: 'Support Tickets', value: '0', icon: '🎫', color: 'from-blue-600 to-cyan-600' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💰', color: 'from-green-600 to-emerald-600' }
  ]

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-6xl mx-auto">
        {/* Header with User Name */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Welcome, {userName}!
            </span>
          </h1>
          <p className={`transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>Here is your account overview and purchased projects</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className={`backdrop-blur-lg border rounded-2xl p-8 hover:border-slate-600/50 transition group duration-300 ${
              isLight
                ? 'border-slate-200 bg-slate-50/40'
                : 'border-slate-700/50 bg-slate-900/40'
            }`}>
              <div className="text-4xl mb-4 group-hover:scale-110 transition">{stat.icon}</div>
              <p className={`mb-2 text-sm transition-colors duration-300 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>{stat.label}</p>
              <p className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
          ))}
          
          <div className={`backdrop-blur-lg border rounded-2xl p-8 hover:border-slate-600/50 transition group duration-300 ${
              isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-700/50 bg-slate-900/40'
          }`}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition">🛒</div>
            <p className={`mb-2 text-sm transition-colors duration-300 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Items in Cart</p>
            <p className={`text-4xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent`}>
              {cartItems.length}
            </p>
          </div>
        </div>

        {/* Your Cart Section */}
        <div className={`backdrop-blur-lg border rounded-2xl p-8 mb-8 transition-all duration-300 ${
          isLight ? 'border-purple-200 bg-purple-50/50' : 'border-cyan-700/30 bg-slate-900/40'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${isLight ? 'text-purple-600' : 'text-cyan-400'}`}>Your Cart</h2>
            {cartItems.length > 0 && (
              <button onClick={handleCheckoutAll} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105">
                🛒 Checkout All ({cartItems.length})
              </button>
            )}
          </div>
          
          {cartItems.length === 0 ? (
            <div className={`text-center py-8 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cartItems.map((item, i) => (
                <div key={i} className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-purple-200/50'
                    : item.isUpgrade
                      ? 'bg-slate-800/50 border-amber-700/50 hover:border-amber-500/50 hover:shadow-amber-900/50'
                      : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:shadow-cyan-900/50'
                }`}>
                  <div className="absolute top-4 right-4">
                    {item.isUpgrade && <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                      isLight
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    }`}>⬆ Upgrade</span>}
                  </div>
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
                    isLight ? 'bg-purple-100' : item.isUpgrade ? 'bg-amber-900/30' : 'bg-slate-900'
                  }`}>{item.isUpgrade ? '⬆' : '🛍️'}</div>
                  
                  <h3 className={`text-lg font-black mb-1 line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.name}</h3>
                  <p className={`text-sm font-semibold mb-4 ${
                    item.isUpgrade
                      ? isLight ? 'text-amber-600' : 'text-amber-400'
                      : isLight ? 'text-purple-600' : 'text-cyan-400'
                  }`}>
                    {item.isUpgrade 
                      ? `Upgrade: ${item.upgradedFrom} → ${item.tier}`
                      : item.tier
                    }
                  </p>
                  
                  {item.isUpgrade && (
                    <div className={`mb-4 p-3 rounded-lg text-xs ${
                      isLight
                        ? 'bg-amber-50 border border-amber-200 text-amber-800'
                        : 'bg-amber-900/20 border border-amber-700/50 text-amber-300'
                    }`}>
                      <p>Already paid: ₹{item.upgradedFromPrice}</p>
                      <p className="font-bold mt-1">Pay now: ₹{item.price}</p>
                    </div>
                  )}
                  
                  <div className={`flex items-end justify-between pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-700/50'}`}>
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.isUpgrade ? 'Upgrade Cost' : 'Price'}
                      </p>
                      <p className={`text-xl font-black ${
                        item.isUpgrade
                          ? isLight ? 'text-amber-600' : 'text-amber-400'
                          : isLight ? 'text-slate-800' : 'text-slate-200'
                      }`}>₹{item.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBuyNow(item.id)}
                        className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:bg-green-600 hover:scale-105 transition font-semibold text-sm flex items-center gap-1"
                        title="Buy this item now"
                      >
                        <span>💳</span> Buy Now
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:scale-105 transition"
                        title="Remove from cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchased Projects */}
        <div className={`backdrop-blur-lg border rounded-2xl p-8 transition-all duration-300 ${
          isLight
            ? 'border-slate-200 bg-slate-50/40'
            : 'border-slate-700/50 bg-slate-900/40'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            isLight ? 'text-purple-600' : 'text-cyan-400'
          }`}>Your Purchased Projects</h2>
          
          {savedProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className={`mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>You haven't purchased any projects yet</p>
              <a href="/projects" className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition">
                Browse Projects
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProjects.map((project, i) => (
                <div key={i} className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-purple-200/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:shadow-cyan-900/50'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
                    isLight ? 'bg-green-100' : 'bg-slate-900'
                  }`}>📦</div>
                  
                  <h3 className={`text-lg font-black mb-1 line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{project.name || 'Project'}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <p className={`text-sm font-semibold ${isLight ? 'text-purple-600' : 'text-cyan-400'}`}>{project.tier || 'Level 1'}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{project.date || 'N/A'}</span>
                  </div>
                  
                  <div className={`flex items-end justify-between pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-700/50'}`}>
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Paid</p>
                      <p className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{project.price || '₹0'}</p>
                    </div>
                    
                    <a
                      href={project.downloadLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-green-500/30"
                    >
                      <span>📥</span> Access
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
