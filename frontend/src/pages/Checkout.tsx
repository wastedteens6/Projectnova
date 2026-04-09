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
  driveLink?: string
}

export default function Checkout() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('token')

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('razorpay')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' })
  const [errorAlert, setErrorAlert] = useState({ show: false, message: '' })
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Get cart from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length === 0) {
      setErrorAlert({ show: true, message: 'Your cart is empty!' })
      setTimeout(() => navigate('/projects'), 2000)
    } else {
      setCartItems(cart)
    }
  }, [navigate])

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
      // Create payment order
      const res = await axios.post('http://localhost:5000/api/checkout/create-order', {
        amount: totalPrice * 100, // Convert to paise
        projectIds: cartItems.map(item => item.id),
        email,
        phone
      })

      // Handle mock payment (development mode)
      if (res.data?.isMockPayment) {
        setSuccessAlert({ show: true, message: '🎭 Mock Payment Successful! (Development Mode)' })
        localStorage.removeItem('cart')
        
        // Add projects to saved projects
        const existingProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]')
        cartItems.forEach(item => {
          existingProjects.push({
            id: item.id,
            name: item.name,
            tier: item.tier || 'Level 1',
            price: `₹${item.price}`,
            date: new Date().toLocaleDateString(),
            downloadLink: item.driveLink || '#'
          })
        })
        localStorage.setItem('savedProjects', JSON.stringify(existingProjects))
        
        setTimeout(() => navigate('/dashboard'), 2000)
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
          handler: function (response: any) {
            // Payment successful
            localStorage.removeItem('cart')
            setSuccessAlert({ show: true, message: 'Payment successful! Adding projects to your library...' })
            
            // Add projects to saved projects
            const existingProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]')
            cartItems.forEach(item => {
              existingProjects.push({
                id: item.id,
                name: item.name,
                tier: item.tier || 'Level 1',
                price: `₹${item.price}`,
                date: new Date().toLocaleDateString(),
                downloadLink: item.driveLink || '#'
              })
            })
            localStorage.setItem('savedProjects', JSON.stringify(existingProjects))
            
            setTimeout(() => navigate('/dashboard'), 2000)
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
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                    isLight
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg disabled:opacity-50'
                      : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50'
                  }`}
                >
                  {loading ? 'Processing...' : `Pay ₹${totalPrice}`}
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
