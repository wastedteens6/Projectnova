import api from '../lib/api';
import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [purchasedProjects, setPurchasedProjects] = useState<any[]>([])
  const [customRequests, setCustomRequests] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaSetupStep, setMfaSetupStep] = useState<'idle' | 'scan' | 'verify' | 'done'>('idle')
  const [mfaQr, setMfaQr] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaDisableCode, setMfaDisableCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState('')
  const [mfaSuccess, setMfaSuccess] = useState('')

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const email = localStorage.getItem('userEmail')
      if (!token || !email) { navigate('/auth/login'); return; }
      setRefreshing(true)

      const [resPurchases, resCustom] = await Promise.all([
        api.get(`/purchases/user?email=${encodeURIComponent(email)}`),
        api.get('/custom-projects/my-requests').catch(() => ({ data: { data: [] } }))
      ])

      setPurchasedProjects(resPurchases.data.data || [])
      setCustomRequests(resCustom.data.data || [])

      setUserEmail(email)
      const storedUserName = localStorage.getItem('userName')
      if (storedUserName) setUserName(storedUserName)
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUserData()
    const interval = setInterval(fetchUserData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api.get('/auth/me')
      .then(r => { if (r.data.user?.mfa_enabled !== undefined) setMfaEnabled(r.data.user.mfa_enabled) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart)
        const seen = new Map<string, any>()
        for (const item of parsed) seen.set(String(item.id), item)
        const deduped = Array.from(seen.values())
        setCartItems(deduped)
      } catch (err) { console.error('Error parsing cart:', err) }
    }
  }, [])

  const handleMfaSetup = async () => {
    setMfaLoading(true); setMfaError(''); setMfaSuccess('')
    try {
      const res = await api.post('/auth/mfa/setup')
      const data = res.data
      if (!data.success) throw new Error(data.error)
      setMfaQr(data.qrDataUrl); setMfaSecret(data.secret); setMfaSetupStep('scan')
    } catch (err: any) { setMfaError(err.response?.data?.error || err.message || 'Setup failed') } finally { setMfaLoading(false) }
  }

  const handleMfaVerifySetup = async () => {
    if (mfaCode.length !== 6) return
    setMfaLoading(true); setMfaError('')
    try {
      const res = await api.post('/auth/mfa/verify-setup', { code: mfaCode })
      const data = res.data
      if (!data.success) throw new Error(data.error)
      setMfaEnabled(true); setMfaSetupStep('done'); setMfaSuccess('MFA enabled!'); setMfaCode('')
    } catch (err: any) { setMfaError(err.response?.data?.error || err.message || 'Invalid code') } finally { setMfaLoading(false) }
  }

  const handleMfaDisable = async () => {
    if (mfaDisableCode.length !== 6) return
    setMfaLoading(true); setMfaError('')
    try {
      const res = await api.post('/auth/mfa/disable', { code: mfaDisableCode })
      const data = res.data
      if (!data.success) throw new Error(data.error)
      setMfaEnabled(false); setMfaSetupStep('idle'); setMfaDisableCode(''); setMfaSuccess('MFA disabled.')
    } catch (err: any) { setMfaError(err.response?.data?.error || err.message || 'Invalid code') } finally { setMfaLoading(false) }
  }

  const handleRemoveFromCart = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const handleUpgrade = (project: any) => {
    const upgradeData = {
      projectId: project.projectId,
      projectSlug: project.slug,
      projectTitle: project.name,
      currentTier: project.tier,
      currentTierLevel: project.currentTierLevel,
      currentPrice: project.price / 100,
      availableTiers: project.tiers || []
    }
    localStorage.setItem('upgradeContext', JSON.stringify(upgradeData))
    navigate(`/projects/${project.slug}?upgrade=true`)
  }

  const totalSpent = purchasedProjects.reduce((acc: number, curr: any) => {
    let price = typeof curr.price === 'number' ? (curr.price > 100 ? curr.price / 100 : curr.price) : 0
    return acc + price
  }, 0)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'projects', label: 'My Projects', icon: '📦' },
    { id: 'requests', label: 'Custom Requests', icon: '🎨' },
    { id: 'cart', label: 'Cart', icon: '🛒', count: cartItems.length },
    { id: 'security', label: 'Security', icon: '🔐' },
  ]

  // Styles
  const cardBg = isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 backdrop-blur-xl border-slate-800'
  const muted  = isLight ? 'text-slate-500' : 'text-slate-400'
  const heading = isLight ? 'text-slate-900' : 'text-white'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pt-20 pb-12 px-6 transition-all duration-300 ${isLight ? 'bg-slate-50' : 'bg-transparent text-white'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">
              Welcome back, <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">{userName}</span>
            </h1>
            <p className={`text-sm ${muted}`}>{userEmail} • Student Dashboard</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUserData()}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isLight ? 'bg-white border border-slate-200 hover:bg-slate-50' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          
          {/* ── Sidebar Navigation ────────────────────────────────────────────── */}
          <aside className={`p-2 rounded-2xl border ${cardBg} hidden lg:block`}>
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? (isLight ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-purple-600 text-white shadow-lg shadow-purple-900/40')
                      : (isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{tab.icon}</span>
                    {tab.label}
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-purple-500 text-white'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : (isLight ? 'bg-white border border-slate-200 text-slate-600' : 'bg-slate-900 border border-slate-800 text-slate-400')
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* ── Main Content Area ─────────────────────────────────────────────── */}
          <main className="space-y-6">
            
            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Purchases', value: purchasedProjects.length, icon: '📦', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Custom Requests', value: customRequests.length, icon: '💡', color: 'from-amber-500 to-orange-600' },
                    { label: 'Total Invested', value: `₹${totalSpent.toLocaleString()}`, icon: '💰', color: 'from-emerald-500 to-green-600' },
                  ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${cardBg}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl p-2 rounded-xl bg-slate-500/10">{stat.icon}</span>
                      </div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${muted}`}>{stat.label}</p>
                      <p className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                    Recent Activity
                  </h3>
                  {purchasedProjects.length === 0 ? (
                    <p className={`text-center py-12 text-sm ${muted}`}>No recent activity to show.</p>
                  ) : (
                    <div className="space-y-4">
                      {purchasedProjects.slice(0, 3).map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-500/5 border border-slate-500/10">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">📦</div>
                            <div>
                              <p className="text-sm font-bold truncate max-w-[200px]">{p.name}</p>
                              <p className={`text-[10px] ${muted}`}>{p.date}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-green-500">₹{p.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: My Projects */}
            {activeTab === 'projects' && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {purchasedProjects.length === 0 ? (
                  <div className={`col-span-full py-20 text-center rounded-2xl border border-dashed ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
                    <p className={muted}>You haven't purchased any projects yet.</p>
                    <button onClick={() => navigate('/projects')} className="mt-4 text-purple-500 font-bold text-sm">Browse catalog →</button>
                  </div>
                ) : (
                  purchasedProjects.map((p, i) => (
                    <div key={i} className={`group rounded-2xl border overflow-hidden transition-all hover:border-purple-500/50 ${cardBg}`}>
                      <div className="aspect-video relative overflow-hidden bg-slate-800">
                        {p.image ? (
                          <img src={p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL||'http://localhost:5000'}${p.image}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>
                        )}
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-md text-[10px] font-bold text-white uppercase">{p.tier}</div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm mb-1 line-clamp-1">{p.name}</h4>
                        <p className={`text-[10px] mb-4 ${muted}`}>Purchased: {p.date}</p>
                        <div className="flex gap-2">
                          <a 
                            href={p.driveLink || '#'} target="_blank" rel="noreferrer"
                            className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-bold text-center hover:bg-green-500 transition"
                          >Access</a>
                          <button 
                            onClick={() => handleUpgrade(p)}
                            className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition"
                          >Upgrade</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Custom Requests */}
            {activeTab === 'requests' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold">Custom Projects</h2>
                  <button onClick={() => navigate('/projects/custom')} className="text-xs font-bold text-purple-500">+ Request New</button>
                </div>
                {customRequests.length === 0 ? (
                  <div className={`py-20 text-center rounded-2xl border border-dashed ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
                    <p className={muted}>No custom requests found.</p>
                  </div>
                ) : (
                  customRequests.map((req, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${cardBg}`}>
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-sm">{req.subject}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          req.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                          req.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>{req.status}</span>
                      </div>
                      <p className={`text-xs mb-4 line-clamp-2 ${muted}`}>{req.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-500/10">
                        <span className={`text-[10px] ${muted}`}>Requested: {new Date(req.created_at).toLocaleDateString()}</span>
                        {req.admin_notes && <span className="text-[10px] text-purple-500 font-bold">Has Admin Notes</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Cart */}
            {activeTab === 'cart' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {cartItems.length === 0 ? (
                  <div className={`py-20 text-center rounded-2xl border border-dashed ${isLight ? 'border-slate-300' : 'border-slate-800'}`}>
                    <p className={muted}>Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, i) => (
                      <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${cardBg}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-xl">🛒</div>
                          <div>
                            <h4 className="font-bold text-sm truncate max-w-[150px] sm:max-w-none">{item.name}</h4>
                            <p className={`text-[10px] ${muted}`}>{item.tier} {item.isUpgrade && '• Upgrade'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black">₹{item.price}</span>
                          <button onClick={() => handleRemoveFromCart(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition">✕</button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => navigate('/checkout')}
                      className="w-full py-3 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition shadow-lg shadow-purple-900/40"
                    >Checkout All (₹{cartItems.reduce((acc, curr) => acc + curr.price, 0)})</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Security */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`p-6 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔐</span>
                    <div>
                      <h3 className="font-bold text-sm">Two-Factor Authentication</h3>
                      <p className={`text-xs ${muted}`}>Add an extra layer of security to your account.</p>
                    </div>
                  </div>

                  {mfaError && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{mfaError}</div>}
                  {mfaSuccess && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs">{mfaSuccess}</div>}

                  {!mfaEnabled && mfaSetupStep === 'idle' && (
                    <button onClick={handleMfaSetup} className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition">Enable MFA</button>
                  )}

                  {mfaSetupStep === 'scan' && (
                    <div className="space-y-6 border-t border-slate-500/10 pt-6">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        {mfaQr && <img src={mfaQr} alt="QR" className="w-40 h-40 rounded-xl border border-slate-800 p-2 bg-white" />}
                        <div className="flex-1 space-y-4">
                          <p className="text-xs font-bold">1. Scan the QR code or enter the key manually:</p>
                          <code className="block p-2 rounded bg-slate-900 text-cyan-400 text-[10px] break-all">{mfaSecret}</code>
                          <p className="text-xs font-bold">2. Enter verification code:</p>
                          <input 
                            type="text" value={mfaCode} onChange={e => setMfaCode(e.target.value.slice(0,6))}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-center text-xl tracking-widest font-mono"
                          />
                          <button onClick={handleMfaVerifySetup} className="w-full py-2 rounded-lg bg-green-600 text-white font-bold text-xs">Verify & Enable</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {mfaEnabled && (
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                      <p className="text-xs font-bold text-green-500 mb-4 flex items-center gap-2"><span>✅</span> MFA is currently active</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" value={mfaDisableCode} onChange={e => setMfaDisableCode(e.target.value.slice(0,6))}
                          placeholder="Code" className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                        />
                        <button onClick={handleMfaDisable} className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold">Disable</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
