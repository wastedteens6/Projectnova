import api from '../lib/api';
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

interface CartItem {
  id: string
  name: string
  price: number
  slug: string
  tier?: string
  tierLevel?: number
  driveLink?: string
  isUpgrade?: boolean
}

export default function Checkout() {
  const { theme } = useTheme()
  const { settings } = useSettings()
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('token')
  const userEmail = localStorage.getItem('userEmail')

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pricesFetching, setPricesFetching] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState('razorpay')
  const [email, setEmail] = useState(userEmail || '')
  const [phone, setPhone] = useState('')
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' })
  const [errorAlert, setErrorAlert] = useState({ show: false, message: '' })
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [razorpayKey, setRazorpayKey] = useState('')
  const [agreed, setAgreed] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token || !userEmail) {
      setErrorAlert({ show: true, message: 'Please login to checkout' })
      setTimeout(() => navigate('/auth/login'), 2000)
    }
  }, [token, userEmail, navigate])

  // ── Load what to pay for ──────────────────────────────────────────────────
  // Priority 1: sessionStorage.pendingCheckout (set by "Buy Now" button)
  //             → always exactly ONE item → correct single-project price
  // Priority 2: cart fallback (for direct /checkout navigation)
  useEffect(() => {
    if (!token || !userEmail) return

    const load = async () => {
      try {
        setPricesFetching(true)

        // ── Priority: "Buy Now" item stored in sessionStorage ──
        const pendingRaw = sessionStorage.getItem('pendingCheckout')
        if (pendingRaw) {
          const pending: CartItem = JSON.parse(pendingRaw)

          // Always re-verify price from backend (prevents stale/tampered prices)
          try {
            if (pending.isUpgrade) {
              const r = await api.post(
                '/purchases/upgrade-tier/preview',
                { project_id: String(pending.id), target_tier_level: pending.tierLevel }
              )
              pending.price = r.data.upgrade_price
            } else {
              const r = await api.get(`/projects/${pending.slug}`)
              if (r.data?.success && r.data?.data?.tiers) {
                const match = r.data.data.tiers.find(
                  (t: any) => Number(t.level) === Number(pending.tierLevel) || t.name === pending.tier
                ) || r.data.data.tiers[0]
                if (match) {
                  pending.price = match.price
                  pending.tier = match.name
                }
              }
            }
          } catch (_) {
            // network error — use stored price as fallback
          }

          setCartItems([pending])
          setPricesFetching(false)
          return
        }

        // ── Fallback: cart-based checkout ──
        const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]')
        const itemIdParam = searchParams.get('itemId')

        if (cart.length === 0) {
          setErrorAlert({ show: true, message: 'Your cart is empty!' })
          setTimeout(() => navigate('/projects'), 2000)
          setPricesFetching(false)
          return
        }

        const toCheckout = itemIdParam
          ? cart.filter(item => String(item.id) === String(itemIdParam))
          : cart

        if (toCheckout.length === 0) {
          setErrorAlert({ show: true, message: 'Item not found!' })
          setTimeout(() => navigate('/dashboard'), 2000)
          setPricesFetching(false)
          return
        }

        // Verify prices from backend
        const verified = await Promise.all(
          toCheckout.map(async item => {
            try {
              if (item.isUpgrade) {
                const r = await api.post(
                  '/purchases/upgrade-tier/preview',
                  { project_id: String(item.id), target_tier_level: item.tierLevel }
                )
                return { ...item, price: r.data.upgrade_price }
              }
              const r = await api.get(`/projects/${item.slug}`)
              if (r.data?.success && r.data?.data?.tiers) {
                const tiers = r.data.data.tiers
                let m = tiers.find((t: any) => Number(t.level) === Number(item.tierLevel))
                if (!m && item.tier) m = tiers.find((t: any) => t.name === item.tier)
                if (!m) m = tiers[0]
                return { ...item, price: m?.price || item.price, tier: m?.name || item.tier, tierLevel: m?.level }
              }
              return item
            } catch {
              return item
            }
          })
        )

        setCartItems(verified)
      } catch (err) {
        console.error('Checkout load error:', err)
        setErrorAlert({ show: true, message: 'Error loading checkout' })
      } finally {
        setPricesFetching(false)
      }
    }

    load()
  }, [navigate, searchParams])

  // Fetch Razorpay Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/api/checkout/config')
        if (res.data.razorpayKeyId) {
          setRazorpayKey(res.data.razorpayKeyId)
        }
      } catch (err) {
        console.error('Failed to fetch razorpay config:', err)
      }
    }
    fetchConfig()
  }, [])

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById('razorpay-script')) {
      setScriptLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setErrorAlert({ show: true, message: 'Failed to load Razorpay library' })
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0)

  const clearCheckoutState = () => {
    sessionStorage.removeItem('pendingCheckout')
    localStorage.removeItem('cart')
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !phone) {
      setErrorAlert({ show: true, message: 'Please fill all fields' })
      setLoading(false)
      return
    }

    if (!agreed) {
      setErrorAlert({ show: true, message: 'Please agree to the Terms and Conditions' })
      setLoading(false)
      return
    }

    if (selectedPayment === 'razorpay' && !scriptLoaded) {
      setErrorAlert({ show: true, message: 'Razorpay is loading... Please try again' })
      setLoading(false)
      return
    }

    try {
      const res = await api.post(
        '/checkout/create-order',
        { amount: totalPrice * 100, projectIds: cartItems.map(i => i.id), phone }
      )

      // ── Razorpay ──
      if (selectedPayment === 'razorpay') {
        const options = {
          key: razorpayKey || 'rzp_test_1DP5mmOlF5G1ag', // Fallback but should use state
          amount: totalPrice * 100,
          currency: 'INR',
          name: settings.siteName || 'ProjectNova',
          description: cartItems[0]?.name || 'Project Purchase',
          order_id: res.data.orderId,
          handler: async (response: any) => {
            try {
              let finalId = response.razorpay_order_id;
              for (const item of cartItems) {
                const endpoint = item.isUpgrade 
                  ? '/purchases/upgrade-tier/confirm'
                  : '/checkout/verify-payment';
                
                const verifyRes = await api.post(
                  endpoint,
                  { 
                    project_id: String(item.id), 
                    projectIds: [item.id],
                    target_tier_level: item.tierLevel, 
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    tier: item.tier || 'Standard', 
                    tierLevel: item.tierLevel || 1, 
                    price: item.price
                  }
                );
                
                if (verifyRes.data.id) finalId = verifyRes.data.id;
              }
              setSuccessAlert({ show: true, message: '✅ Payment successful!' })
              clearCheckoutState()
              setTimeout(() => navigate(`/receipt/${finalId}`), 1000)
            } catch (err: any) {
              setErrorAlert({ 
                show: true, 
                message: 'Verification failed: ' + (err.response?.data?.error || 'Please contact support.') 
              })
            }
          },
          prefill: { email, contact: phone },
          theme: { color: isLight ? '#9333ea' : '#06b6d4' },
          modal: {
            ondismiss: () => {
              setLoading(false)
              setErrorAlert({ show: true, message: 'Payment cancelled by user' })
              setTimeout(() => setErrorAlert({ show: false, message: '' }), 3000)
            }
          }
        }
        // @ts-ignore
        if (window.Razorpay) {
          // @ts-ignore
          const rzp = new window.Razorpay(options)
          
          rzp.on('payment.failed', (response: any) => {
            setErrorAlert({ 
              show: true, 
              message: `Payment failed: ${response.error.description}` 
            })
            setLoading(false)
          })

          rzp.open()
        } else {
          setErrorAlert({ show: true, message: 'Razorpay not available. Please refresh.' })
        }
      } else if (selectedPayment === 'upi') {
        setSuccessAlert({ show: true, message: 'UPI Payment initiated. Please complete on your UPI app.' })
        setTimeout(() => { clearCheckoutState(); navigate('/dashboard') }, 3000)
      }
    } catch (err: any) {
      setErrorAlert({ show: true, message: 'Payment failed: ' + (err.response?.data?.error || err.message) })
    } finally {
      setLoading(false)
    }
  }

  const item = cartItems[0]

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 transition-all duration-300 w-full pointer-events-none ${
      isLight ? 'text-slate-900 bg-transparent' : 'text-white bg-transparent'
    }`}>
      <div className="container max-w-3xl mx-auto pointer-events-auto">

        {/* Alerts */}
        {successAlert.show && (
          <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg z-50 border ${
            isLight ? 'bg-green-50 border-green-300 text-green-700' : 'bg-green-500/20 border-green-500/50 text-green-300'
          }`}>{successAlert.message}</div>
        )}
        {errorAlert.show && (
          <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg z-50 border ${
            isLight ? 'bg-red-50 border-red-300 text-red-700' : 'bg-red-500/20 border-red-500/50 text-red-300'
          }`}>{errorAlert.message}</div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-5xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Checkout</h1>
          <p className={`text-xl ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Complete your purchase</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Left: Payment form */}
          <div className={`md:col-span-2 backdrop-blur-lg border rounded-2xl p-8 transition-all duration-300 ${
            isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-700/50 bg-slate-900/40'
          }`}>

            {/* Payment Method */}
            <div className="mb-8">
              <h3 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Payment Method
              </h3>
              <div className={`flex items-center p-4 rounded-lg border-2 border-purple-600 ${
                isLight ? 'bg-purple-50' : 'bg-purple-500/20'
              }`}>
                <div className="w-4 h-4 rounded-full bg-purple-600" />
                <span className={`ml-3 font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Razorpay (Cards, UPI, NetBanking, Wallets)
                </span>
              </div>
            </div>

            {/* Billing Details */}
            <form onSubmit={handlePayment}>
              <h3 className={`text-lg font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Billing Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition duration-300 ${
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:border-purple-600'
                        : 'border-slate-700 bg-slate-900/50 text-white focus:border-purple-600'
                    }`}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition duration-300 ${
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:border-purple-600'
                        : 'border-slate-700 bg-slate-900/50 text-white focus:border-purple-600'
                    }`}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    id="agreed"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="agreed" className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    I agree to the <span className="text-purple-500 font-semibold cursor-pointer hover:underline">Terms and Conditions</span> and <span className="text-purple-500 font-semibold cursor-pointer hover:underline">Refund Policy</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || pricesFetching || !agreed}
                  className={`w-full py-3 rounded-lg font-bold transition transform hover:scale-105 bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg disabled:opacity-50`}
                >
                  {pricesFetching ? 'Loading...' : loading ? 'Processing...' : `Pay ₹${totalPrice}`}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className={`backdrop-blur-lg border rounded-2xl p-8 sticky top-24 transition-all duration-300 ${
              isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-700/50 bg-slate-900/40'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${isLight ? 'text-purple-600' : 'text-cyan-400'}`}>
                Order Summary
              </h3>

              <div className={`space-y-3 mb-6 pb-6 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                {/* Selected item */}
                {item && !pricesFetching && (
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.isUpgrade ? `⬆️ Upgrade → ${item.tier}` : `📦 ${item.tier || 'Standard'} License`}
                      </p>
                    </div>
                    <span className={`font-bold shrink-0 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                      ₹{item.price}
                    </span>
                  </div>
                )}
                {pricesFetching && (
                  <div className="flex items-center gap-2 py-2">
                    <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                      isLight ? 'border-purple-600' : 'border-purple-400'
                    }`} />
                    <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Loading...</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Taxes (0%)</span>
                  <span className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>₹0</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Total</span>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  ₹{totalPrice}
                </span>
              </div>

              <div className={`p-4 rounded-lg text-sm ${
                isLight ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
              }`}>
                <p className="font-semibold mb-1">✓ Instant Access</p>
                <p>After payment, the project will be added to your library immediately.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
