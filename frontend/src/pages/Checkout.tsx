import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

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
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('token')
  const userEmail = localStorage.getItem('userEmail')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token || !userEmail) {
      setErrorAlert({ show: true, message: 'Please login to checkout' })
      setTimeout(() => navigate('/auth/login'), 2000)
    }
  }, [token, userEmail, navigate])

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pricesFetching, setPricesFetching] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState('razorpay')
  const [email, setEmail] = useState(userEmail || '')
  const [phone, setPhone] = useState('')
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' })
  const [errorAlert, setErrorAlert] = useState({ show: false, message: '' })
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Get cart from localStorage and fetch fresh prices from database
  useEffect(() => {
    if (!token || !userEmail) return; // Wait for auth check

    const fetchCartWithPrices = async () => {
      try {
        setPricesFetching(true)
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const itemIdParam = searchParams.get('itemId')
        
        console.log('🛒 Cart from localStorage:', cart)
        console.log('📦 Checkout mode - itemId param:', itemIdParam)
        
        if (cart.length === 0) {
          setErrorAlert({ show: true, message: 'Your cart is empty!' })
          setTimeout(() => navigate('/projects'), 2000)
          setPricesFetching(false)
          return
        }

        // Filter cart to only include the specific item if itemId is provided
        const itemsToCheckout = itemIdParam 
          ? cart.filter((item: CartItem) => item.id === itemIdParam)
          : cart

        if (itemsToCheckout.length === 0) {
          setErrorAlert({ show: true, message: 'Item not found in cart!' })
          setTimeout(() => navigate('/dashboard'), 2000)
          setPricesFetching(false)
          return
        }

        console.log('🛍️ Items to checkout:', itemsToCheckout)

        // Fetch correct prices from backend for each cart item
        const updatedCart = await Promise.all(
          itemsToCheckout.map(async (item: CartItem) => {
            try {
              // ─── UPGRADE ITEMS: price difference must come from the backend ───
              // NEVER re-calculate on the frontend or use the full DB tier price.
              if (item.isUpgrade) {
                console.log(`⬆️  Upgrade item: ${item.name} → fetching server-computed upgrade price`)
                const upgradeRes = await axios.post(
                  'http://localhost:5000/api/purchases/upgrade-tier/preview',
                  { project_id: String(item.id), target_tier_level: item.tierLevel },
                  { headers: { Authorization: `Bearer ${token}` } }
                )
                const upgradeData = upgradeRes.data
                console.log(`✅ Server upgrade price for ${item.name}: ₹${upgradeData.upgrade_price}`)
                return {
                  ...item,
                  price: upgradeData.upgrade_price, // ONLY charge the difference
                }
              }

              // ─── REGULAR ITEMS: fetch fresh price from DB ────────────────────
              console.log(`🔍 Fetching prices for: ${item.slug} (tier="${item.tier}", tierLevel=${item.tierLevel})`)
              const res = await axios.get(`http://localhost:5000/api/projects/${item.slug}`)

              if (res.data?.success && res.data?.data?.tiers) {
                const projectTiers = res.data.data.tiers

                let matchingTier = null
                if (item.tierLevel !== undefined && item.tierLevel !== null) {
                  matchingTier = projectTiers.find((t: any) => t.level === item.tierLevel)
                }
                if (!matchingTier && item.tier) {
                  matchingTier = projectTiers.find((t: any) => t.name === item.tier)
                }
                if (!matchingTier) matchingTier = projectTiers[0]

                const finalPrice = matchingTier?.price || item.price
                console.log(`✅ ${item.name}: Using price ₹${finalPrice}`)
                return {
                  ...item,
                  price: finalPrice,
                  tier: matchingTier?.name || item.tier,
                  tierLevel: matchingTier?.level,
                }
              }
              return item
            } catch (err) {
              console.warn(`❌ Failed to fetch price for ${item.name}:`, err)
              return item
            }
          })
        )

        console.log('🎯 Updated cart with fresh prices:', updatedCart)
        setCartItems(updatedCart)
      } catch (err) {
        console.error('Error fetching cart:', err)
        setErrorAlert({ show: true, message: 'Error loading cart' })
      } finally {
        setPricesFetching(false)
      }
    }

    fetchCartWithPrices()
  }, [navigate, searchParams])

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
    script.onload = () => {
      setScriptLoaded(true)
    }
    script.onerror = () => {
      setErrorAlert({ show: true, message: 'Failed to load Razorpay library' })
    }
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !phone) {
      setErrorAlert({ show: true, message: 'Please fill all fields' })
      setLoading(false)
      return
    }

    if (selectedPayment === 'razorpay' && !scriptLoaded && !res.data?.isMockPayment) {
      setErrorAlert({ show: true, message: 'Razorpay is loading... Please try again' })
      setLoading(false)
      return
    }

    try {
      console.log('💳 Payment initiated:')
      console.log('  - Total Price: ₹' + totalPrice)
      console.log('  - Cart Items:', cartItems)
      console.log('  - Phone:', phone)
      
      // Create payment order
      const res = await axios.post('http://localhost:5000/api/checkout/create-order', {
        amount: totalPrice * 100, // Convert to paise
        projectIds: cartItems.map(item => item.id),
        phone
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Handle mock payment (development mode)
      if (res.data?.isMockPayment) {
        console.log('🎭 Mock payment mode - saving to database')
        try {
          const mockOrderId = `mock_${Date.now()}`

          // Process each cart item — upgrades use the confirm endpoint, regular buys use verify-payment
          for (const item of cartItems) {
            if (item.isUpgrade) {
              // UPGRADE: call the dedicated confirm endpoint which updates the existing Transaction
              await axios.post(
                'http://localhost:5000/api/purchases/upgrade-tier/confirm',
                {
                  project_id: String(item.id),
                  target_tier_level: item.tierLevel,
                  order_id: `${mockOrderId}_${item.id}_upgrade`,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              console.log(`✅ Upgrade confirmed for ${item.name} → tier level ${item.tierLevel}`)
            } else {
              // REGULAR PURCHASE
              await axios.post(
                'http://localhost:5000/api/checkout/verify-payment',
                {
                  orderId: `${mockOrderId}_${item.id}`,
                  projectIds: [item.id],
                  tier: item.tier || 'Level 1',
                  price: item.price,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              console.log(`✅ Purchase recorded for ${item.name}`)
            }
          }

          setSuccessAlert({ show: true, message: '🎭 Mock Payment Successful! Purchase saved.' })
          localStorage.removeItem('cart')
          setTimeout(() => navigate('/dashboard'), 1500)
        } catch (verifyErr) {
          console.error('❌ Mock payment verification failed:', verifyErr)
          setErrorAlert({
            show: true,
            message: 'Failed to save purchase: ' + ((verifyErr as any).response?.data?.error || (verifyErr as any).message),
          })
          setLoading(false)
          return
        }
        setLoading(false)
        return
      }

      if (selectedPayment === 'razorpay') {
        // Initialize Razorpay
        const options = {
          key: 'rzp_test_1DP5mmOlF5G1ag', // Test Key
          amount: totalPrice * 100,
          currency: 'INR',
          name: 'WastedTeens☠️',
          description: `Purchasing ${cartItems.length} project(s)`,
          order_id: res.data.orderId,
          handler: async function (response: any) {
            try {
              // Process each item — upgrades route to the confirm endpoint
              for (const item of cartItems) {
                if (item.isUpgrade) {
                  await axios.post(
                    'http://localhost:5000/api/purchases/upgrade-tier/confirm',
                    {
                      project_id: String(item.id),
                      target_tier_level: item.tierLevel,
                      order_id: response.razorpay_order_id,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  )
                } else {
                  await axios.post(
                    'http://localhost:5000/api/checkout/verify-payment',
                    {
                      orderId: response.razorpay_order_id,
                      projectIds: [item.id],
                      tier: item.tier || 'Level 1',
                      price: item.price,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  )
                }
              }
              setSuccessAlert({ show: true, message: '✅ Payment successful! Generating receipt...' })
              localStorage.removeItem('cart')
              setTimeout(() => navigate(`/receipt/${response.razorpay_order_id}`), 1000)
            } catch (verifyErr) {
              console.error('Payment verification failed:', verifyErr)
              setErrorAlert({ show: true, message: 'Verification failed. Please contact support.' })
            }
          },
          prefill: {
            email,
            contact: phone
          },
          theme: {
            color: isLight ? '#9333ea' : '#06b6d4'
          }
        }

        // @ts-ignore
        if (window.Razorpay) {
          const razorpay = new window.Razorpay(options)
          razorpay.open()
        } else {
          setErrorAlert({ show: true, message: 'Razorpay not available. Please refresh and try again.' })
        }
      } else if (selectedPayment === 'upi') {
        // UPI Payment handling
        setSuccessAlert({ show: true, message: 'UPI Payment initiated. Please complete payment on your UPI app.' })
        setTimeout(() => {
          localStorage.removeItem('cart')
          navigate('/dashboard')
        }, 3000)
      }
    } catch (err: any) {
      setErrorAlert({ show: true, message: 'Payment failed: ' + (err.response?.data?.error || err.message) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 transition-all duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-3xl mx-auto">
        {/* Alerts */}
        {successAlert.show && (
          <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg z-50 animate-pulse border transition-all duration-300 ${
            isLight
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-green-500/20 border-green-500/50 text-green-300'
          }`}>
            {successAlert.message}
          </div>
        )}
        
        {errorAlert.show && (
          <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg z-50 animate-pulse border transition-all duration-300 ${
            isLight
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-red-500/20 border-red-500/50 text-red-300'
          }`}>
            {errorAlert.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-5xl font-bold mb-2 transition-colors duration-300 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Checkout</h1>
          <p className={`text-xl transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>Complete your purchase</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className={`md:col-span-2 backdrop-blur-lg border rounded-2xl p-8 transition-all duration-300 ${
            isLight
              ? 'border-slate-200 bg-slate-50/40'
              : 'border-slate-700/50 bg-slate-900/40'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
              isLight ? 'text-purple-600' : 'text-cyan-400'
            }`}>Your Cart Items</h2>

            {cartItems.length === 0 ? (
              <p className={`transition-colors duration-300 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>No items in cart</p>
            ) : pricesFetching ? (
              <div className="flex items-center justify-center py-8">
                <div className={`flex flex-col items-center gap-3 ${isLight ? '' : ''}`}>
                  <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                    isLight ? 'border-purple-600' : 'border-purple-400'
                  }`} />
                  <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Fetching latest prices from database...
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {cartItems.map((item, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 rounded-lg border transition-all duration-300 ${
                    isLight
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}>
                    <div>
                      <h3 className={`font-semibold transition-colors duration-300 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>{item.name}</h3>
                      <p className={`text-sm transition-colors duration-300 ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>Tier 1 License</p>
                    </div>
                    <span className={`font-bold text-lg transition-colors duration-300 ${
                      isLight ? 'text-purple-600' : 'text-purple-400'
                    }`}>₹{item.price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mb-8">
              <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Select Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedPayment === 'razorpay'
                    ? isLight
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-purple-600 bg-purple-500/20'
                    : isLight
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-700 bg-slate-800/50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={selectedPayment === 'razorpay'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className={`ml-3 font-semibold transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>Razorpay (Credit/Debit Card, NetBanking, Wallet)</span>
                </label>

                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedPayment === 'upi'
                    ? isLight
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-purple-600 bg-purple-500/20'
                    : isLight
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-700 bg-slate-800/50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={selectedPayment === 'upi'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className={`ml-3 font-semibold transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>UPI (Google Pay, PhonePe, Paytm)</span>
                </label>
              </div>
            </div>

            {/* Billing Details */}
            <form onSubmit={handlePayment}>
              <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Billing Details</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-slate-200'
                  }`}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-slate-200'
                  }`}>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition duration-300 ${
                      isLight
                        ? 'border-slate-300 bg-white text-slate-900 focus:border-purple-600'
                        : 'border-slate-700 bg-slate-900/50 text-white focus:border-purple-600'
                    }`}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || pricesFetching}
                  className={`w-full py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                    isLight
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg disabled:opacity-50'
                      : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50'
                  }`}
                >
                  {pricesFetching ? 'Loading prices...' : loading ? 'Processing...' : `Pay ₹${totalPrice}`}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Card */}
          <div>
            <div className={`backdrop-blur-lg border rounded-2xl p-8 sticky top-24 transition-all duration-300 ${
              isLight
                ? 'border-slate-200 bg-slate-50/40'
                : 'border-slate-700/50 bg-slate-900/40'
            }`}>
              <h3 className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                isLight ? 'text-purple-600' : 'text-cyan-400'
              }`}>Order Summary</h3>

              <div className={`space-y-3 mb-6 pb-6 border-b transition-all duration-300 ${
                isLight ? 'border-slate-200' : 'border-slate-700'
              }`}>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-300 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>Subtotal</span>
                  <span className={`font-semibold transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-300 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>Taxes (0%)</span>
                  <span className={`font-semibold transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>₹0</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className={`text-lg font-bold transition-colors duration-300 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>Total</span>
                <span className={`text-2xl font-black bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent`}>
                  ₹{totalPrice}
                </span>
              </div>

              <div className={`p-4 rounded-lg text-sm transition-all duration-300 ${
                isLight
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
              }`}>
                <p className="font-semibold mb-1">✓ Instant Access</p>
                <p>After successful payment, projects will be added to your library immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
