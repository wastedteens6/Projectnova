import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [purchasedProjects, setPurchasedProjects] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch user-specific data from backend
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const email = localStorage.getItem('userEmail')
      
      if (!token || !email) {
        navigate('/auth/login')
        return
      }

      setRefreshing(true)

      // Fetch user's purchased projects
      const response = await fetch(`http://localhost:5000/api/purchases/user?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch purchases')
      }

      const data = await response.json()
      setPurchasedProjects(data.data || [])
      setUserEmail(email)

      // Get stored name
      const storedUserName = localStorage.getItem('userName')
      if (storedUserName) {
        setUserName(storedUserName)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUserData()

    // Get cart items from localStorage — deduplicate by project id
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart)
        // Keep only the last entry per project id (most recent tier selection wins)
        const seen = new Map<string, any>()
        for (const item of parsed) {
          seen.set(String(item.id), item)
        }
        const deduped = Array.from(seen.values())
        setCartItems(deduped)
        // Persist deduped cart back so it's clean
        if (deduped.length !== parsed.length) {
          localStorage.setItem('cart', JSON.stringify(deduped))
        }
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

  const handleBuyNow = (item: any) => {
    // Store this single item in sessionStorage so checkout charges only it
    sessionStorage.setItem('pendingCheckout', JSON.stringify(item))
    navigate('/checkout')
  }

  const handleCheckoutAll = () => {
    // Navigate to checkout without itemId to checkout all items
    navigate('/checkout')
  }

  const handleUpgrade = (project: any) => {
    // Store upgrade context and navigate to project detail with upgrade flag
    const upgradeData = {
      projectId: project.projectId,
      projectSlug: project.slug,
      projectTitle: project.name,
      currentTier: project.tier,
      currentTierLevel: project.currentTierLevel,
      currentPrice: project.price / 100, // Convert paise to rupees
      availableTiers: project.tiers || []
    }
    localStorage.setItem('upgradeContext', JSON.stringify(upgradeData))
    navigate(`/projects/${project.slug}?upgrade=true`)
  }

  // Calculate total spent based on purchased projects
  const totalSpent = purchasedProjects.reduce((acc: number, curr: any) => {
    // Convert from paise to rupees (divide by 100)
    // If price is already in rupees (string format), use as-is
    let priceInRupees = 0;
    
    if (typeof curr.price === 'number') {
      // If it's a number and > 100, assume it's in paise
      priceInRupees = curr.price > 100 ? curr.price / 100 : curr.price;
    } else {
      // Parse string price
      const priceStr = curr.price?.toString() || '0';
      const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
      // If number is > 100, assume it's paise
      priceInRupees = numericPrice > 100 ? numericPrice / 100 : numericPrice;
    }
    
    return acc + priceInRupees;
  }, 0)

  const stats = [
    { label: 'Purchased Projects', value: purchasedProjects.length.toString(), icon: '📦', color: 'from-purple-600 to-pink-600' },
    { label: 'Support Tickets', value: '0', icon: '🎫', color: 'from-blue-600 to-cyan-600' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💰', color: 'from-green-600 to-emerald-600' }
  ]

  // Render loading state
  if (loading) {
    return (
      <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 bg-transparent`}>
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 w-full ${
      isLight ? 'text-slate-900 bg-transparent' : 'text-white bg-transparent'
    }`}>
      <div className="container max-w-6xl mx-auto">
        {/* Header with User Name and Refresh Button */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Welcome, {userName}!
              </span>
            </h1>
            <p className={`transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>Here is your account overview and purchased projects</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              refreshing
                ? 'opacity-50 cursor-not-allowed'
                : isLight
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-cyan-900/40 text-cyan-400 hover:bg-cyan-900/60'
            }`}
            title="Reload page and refresh dashboard data"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            Refresh
          </button>
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
                  
                  {item.image ? (
                    <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.name} className="w-12 h-12 rounded-xl object-cover mb-4" />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
                      isLight ? 'bg-purple-100' : item.isUpgrade ? 'bg-amber-900/30' : 'bg-slate-900'
                    }`}>{item.isUpgrade ? '⬆' : '🛍️'}</div>
                  )}
                  
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
                        onClick={() => handleBuyNow(item)}
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
          
          {purchasedProjects.length === 0 ? (
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
              {purchasedProjects.map((project, i) => (
                <div key={i} className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isLight
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
                }`}>
                  {/* Browse Page Style Image Header */}
                  <div className={`relative h-48 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    {project.image ? (
                      <img src={project.image.startsWith('http') ? project.image : `http://localhost:5000${project.image}`} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" /></svg>
                      </div>
                    )}
                    {/* Hovering Tier Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wide ${
                        isLight ? 'bg-purple-100 text-purple-700' : 'bg-cyan-900/80 text-cyan-300 backdrop-blur-sm'
                      }`}>
                        {project.tier || 'Level 1'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Content & Action Area */}
                  <div className={`p-5 flex flex-col h-[calc(100%-12rem)] ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
                    <div className="flex justify-between items-start mb-1">
                       <h3 className={`font-bold text-lg line-clamp-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{project.name || 'Project'}</h3>
                    </div>
                    {/* Date Purchased */}
                    <p className={`text-xs mb-4 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Purchased: {project.date || 'N/A'}</p>
                    
                    <div className={`mt-auto pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-700/50'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className={`text-xs uppercase font-bold mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Amount Paid</p>
                          <p className={`text-xl font-black ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            ₹{(() => {
                              const price = typeof project.price === 'number' ? (project.price > 100 ? project.price / 100 : project.price).toLocaleString() : project.price || '0';
                              return price;
                            })()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Grid Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={(() => {
                            if (project.driveLink) return project.driveLink
                            const tiers: any[] = project.tiers || []
                            const currentLevel = project.currentTierLevel || 1
                            const match = tiers.find((t: any) => Number(t.level) === Number(currentLevel))
                            return match?.drive_link || '#'
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:scale-105 transition shadow-lg shadow-green-500/30"
                          title={`Access tier ${project.currentTierLevel || 1}`}
                        >
                          📥 Access
                        </a>
                        <button
                          onClick={() => handleUpgrade(project)}
                          className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold text-sm hover:scale-105 transition shadow-lg shadow-blue-500/30"
                          title="Upgrade"
                        >
                          ⬆️ Upgrade
                        </button>
                      </div>
                    </div>
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
