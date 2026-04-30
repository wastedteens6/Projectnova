import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { HiOutlineTrash, HiOutlineArrowRight, HiOutlineShoppingBag } from 'react-icons/hi2'

interface CartItem {
  id: string
  name: string
  price: number
  slug: string
  tier?: string
  tierLevel?: number
  image?: string
}

export default function Cart() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(savedCart)
  }, [])

  const removeFromCart = (id: string, tierLevel?: number) => {
    const updatedCart = cartItems.filter(item => !(item.id === id && item.tierLevel === tierLevel))
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Trigger storage event for navbar to update
    window.dispatchEvent(new Event('storage'))
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0)

  const handleCheckout = () => {
    navigate('/checkout')
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 transition-all duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b1120] text-white'
    }`}>
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">Your Cart</h1>
            <p className={`text-lg ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={() => navigate('/projects')}
              className={`text-sm font-bold flex items-center gap-2 hover:underline ${
                isLight ? 'text-purple-600' : 'text-cyan-400'
              }`}
            >
              Continue Shopping <HiOutlineArrowRight />
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${
            isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/20'
          }`}>
            <div className="text-6xl mb-6 flex justify-center opacity-20">
              <HiOutlineShoppingBag />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className={`mb-8 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Looks like you haven't added any projects to your cart yet.
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:scale-105 transition shadow-lg shadow-purple-500/20"
            >
              Browse Projects
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.tierLevel}-${idx}`}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    isLight 
                      ? 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:shadow-lg'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={`w-24 h-24 rounded-xl overflow-hidden shrink-0 ${
                    isLight ? 'bg-slate-100' : 'bg-slate-800'
                  }`}>
                    {item.image ? (
                      <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        <HiOutlineShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate group-hover:text-purple-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className={`text-sm mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.tier} License
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => removeFromCart(item.id, item.tierLevel)}
                    className={`p-3 rounded-xl transition-colors ${
                      isLight 
                        ? 'text-slate-400 hover:bg-red-50 hover:text-red-500' 
                        : 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
                    }`}
                    title="Remove from cart"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className={`sticky top-24 p-8 rounded-3xl border transition-all duration-300 ${
                isLight 
                  ? 'bg-white border-slate-100 shadow-xl shadow-slate-200/50' 
                  : 'bg-slate-900/40 border-slate-800 shadow-2xl shadow-black/20'
              }`}>
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Subtotal</span>
                    <span className="font-bold">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Tax</span>
                    <span className="font-bold">₹0</span>
                  </div>
                  <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                    <div className="flex justify-between items-end">
                      <span className="font-bold">Total Amount</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className={`text-center text-xs mt-6 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Secure Checkout Powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
