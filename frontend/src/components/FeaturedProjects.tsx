import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const formatted = path.startsWith('/') ? path : `/${path}`
  return `http://localhost:5000${formatted}`
}

export default function FeaturedProjects() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchaseAlert, setPurchaseAlert] = useState({ show: false, message: '' })
  const [purchasedProjects, setPurchasedProjects] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    fetchFeaturedProjects()
    fetchPurchasedProjects()
  }, [])

  const fetchFeaturedProjects = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://localhost:5000/api/projects/featured')
      setProjects(res.data.data || [])
      setError('')
    } catch (err) {
      console.error('Error fetching featured projects:', err)
      setError('Failed to load featured projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchasedProjects = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setPurchasedProjects({})
      return
    }

    try {
      const res = await axios.get('http://localhost:5000/api/purchases/my-purchases', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const map: { [key: string]: any } = {}
      res.data.purchases?.forEach((p: any) => {
        map[p.project_id] = {
          tier: p.tier_name,
          tierLevel: p.tier_level,
          date: new Date(p.created_at).toLocaleDateString(),
          price: `₹${p.price_in_paise / 100}`,
          priceInPaise: p.price_in_paise,
          transactionId: p.transaction_id
        }
      })
      setPurchasedProjects(map)
    } catch (err) {
      console.error('Error fetching purchased projects:', err)
      setPurchasedProjects({})
    }
  }

  const isProjectPurchased = (id: string) => !!purchasedProjects[id]

  const handleAddToCart = (e: React.MouseEvent, project: any) => {
    e.preventDefault()
    e.stopPropagation()
    
    const token = localStorage.getItem('token')
    if (!token) {
      setPurchaseAlert({ show: true, message: 'Please login to add to cart!' })
      setTimeout(() => window.location.href = '/auth/login', 2000)
      return
    }

    // Add the first tier to cart
    const tier = project.tiers?.[0]
    if (!tier) {
      setPurchaseAlert({ show: true, message: 'No pricing tiers available' })
      return
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({
      id: project.id,
      name: project.title,
      tier: tier.name || 'Starter',
      tierLevel: tier.level || 1,
      price: tier.price,
      slug: project.slug,
      driveLink: tier.drive_link || '#'
    })
    localStorage.setItem('cart', JSON.stringify(cart))
    
    setPurchaseAlert({ show: true, message: `✅ ${project.title} added to cart!` })
    setTimeout(() => setPurchaseAlert({ show: false, message: '' }), 3000)
  }

  const handleDownloadReceipt = (e: React.MouseEvent, project: any) => {
    e.preventDefault()
    e.stopPropagation()
    
    const purchased = purchasedProjects[project.id]
    if (!purchased) return

    // Create a simple receipt text
    const receiptContent = `
PROJECT PURCHASE RECEIPT
=======================

Project: ${project.title}
Tier: ${purchased.tier}
Total Amount: ${purchased.price}
Purchase Date: ${purchased.date}
Transaction ID: ${purchased.transactionId}

Thank you for your purchase!
    `

    // Create a blob and download
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent))
    element.setAttribute('download', `receipt-${project.slug}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    setPurchaseAlert({ show: true, message: `✅ Receipt downloaded!` })
    setTimeout(() => setPurchaseAlert({ show: false, message: '' }), 3000)
  }

  const handleUpgradePackage = (e: React.MouseEvent, project: any) => {
    e.preventDefault()
    e.stopPropagation()

    const currentTierData = purchasedProjects[project.id]
    if (!currentTierData) return

    // Find current tier index by tier NAME (not level)
    const currentTierIndex = project.tiers?.findIndex((t: any) => t.name === currentTierData.tier) ?? -1
    
    if (currentTierIndex === -1 || currentTierIndex === (project.tiers?.length || 0) - 1) {
      setPurchaseAlert({ show: true, message: 'Already at highest tier!' })
      return
    }

    const upgradeTiers = project.tiers?.slice(currentTierIndex + 1) || []
    
    if (upgradeTiers.length === 0) {
      setPurchaseAlert({ show: true, message: 'No higher tiers available' })
      return
    }

    const upgradeData = {
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      currentTier: currentTierData.tier,
      currentTierLevel: currentTierData.tierLevel, // Correct level (1, 2, 3)
      currentPrice: currentTierData.priceInPaise / 100,
      availableTiers: upgradeTiers
    }

    localStorage.setItem('upgradeContext', JSON.stringify(upgradeData))
    window.location.href = `/projects/${project.slug}?upgrade=true`
  }

  if (loading) {
    return (
      <section className={`py-20 px-4 transition-colors duration-300 ${
        isLight ? 'bg-white' : 'bg-slate-950'
      }`}>
        <div className="container max-w-6xl mx-auto text-center">
          <p className={`text-lg ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Loading featured projects...</p>
        </div>
      </section>
    )
  }

  if (error || projects.length === 0) {
    return null
  }

  return (
    <section className={`py-20 px-4 transition-colors duration-300 ${
      isLight ? 'bg-slate-50' : 'bg-slate-900/30'
    }`}>
      <div className="container max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-3xl`}>⭐</span>
            <h2 className={`text-4xl font-bold transition-colors duration-300 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>Featured Projects</h2>
          </div>
          <p className={`text-lg transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>Trending and most sought-after academic projects</p>
        </div>

        {/* Featured Projects Grid - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {projects.slice(0, 3).map((project: any) => {
            const minPrice = Math.min(...(project.tiers?.map((t: any) => t.price) || [0]))
            const rating = 4.8

            return (
              <div
                key={project.id}
                className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => navigate(`/projects/${project.slug}`)}
              >
                {/* Image Container */}
                <div className={`relative h-48 overflow-hidden ${
                  isLight ? 'bg-slate-100' : 'bg-slate-800'
                }`}>
                  {project.media?.images?.length > 0 || project.images?.length > 0 ? (
                    <img
                      src={getImageUrl((project.media?.images || project.images)[0])}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                    </div>
                  )}

                  {/* Add to Cart Symbol - Top Right */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => handleAddToCart(e, project)}
                      className="text-3xl hover:scale-125 transition-transform duration-200"
                      title="Add to Cart"
                    >
                      🛒
                    </button>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isLight
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-purple-600/60 text-purple-100'
                    }`}>
                      ⭐ Featured
                    </span>
                  </div>

                  {/* Category Badge */}
                  {project.category && (
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide ${
                        isLight
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-700/60 text-slate-200'
                      }`}>
                        {project.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`p-5 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                  {/* Title */}
                  <h3 className={`font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm mb-4 line-clamp-2 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {project.description || 'No description available'}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex gap-1 flex-wrap mb-4">
                    {(project.tech_stack || []).slice(0, 3).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          isLight
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                    {(project.tech_stack?.length || 0) > 3 && (
                      <span className={`text-xs font-medium px-2 py-1 ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        +{project.tech_stack.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer with Action Buttons */}
                  <div className={`pt-4 border-t ${
                    isLight ? 'border-slate-100' : 'border-slate-700/50'
                  }`}>
                    {isProjectPurchased(project.id) ? (
                      // Show Upgrade and Download Receipt buttons for purchased projects
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => handleUpgradePackage(e, project)}
                          className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold text-sm hover:scale-105 transition shadow-lg shadow-blue-500/30"
                          title="Upgrade to a higher tier"
                        >
                          ⬆️ Upgrade
                        </button>
                        <button
                          onClick={(e) => handleDownloadReceipt(e, project)}
                          className="px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:scale-105 transition shadow-lg shadow-green-500/30"
                          title="Download purchase receipt"
                        >
                          📥 Receipt
                        </button>
                      </div>
                    ) : (
                      // Show Buy Now button for non-purchased projects
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/projects/${project.slug}`)
                        }}
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-base hover:scale-105 transition shadow-lg shadow-purple-500/30"
                        title="Buy this project"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/projects')}
            className={`group relative px-8 py-4 font-bold text-lg transition-all duration-300 ${
              isLight ? 'text-white' : 'text-white'
            }`}
          >
            <div className={`absolute inset-0 rounded-lg blur group-hover:blur-md transition duration-300 opacity-75 group-hover:opacity-100 ${
              isLight
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                : 'bg-gradient-to-r from-purple-600 to-cyan-600'
            }`}></div>
            <div className={`relative px-8 py-4 rounded-lg flex items-center gap-2 transition-colors duration-300 ${
              isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
            }`}>
              View All Projects
              <span>→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Purchase Alert */}
      {purchaseAlert.show && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white font-semibold animate-bounce ${
          purchaseAlert.message.includes('✅')
            ? 'bg-green-500'
            : 'bg-red-500'
        }`}
        style={{ zIndex: 9999 }}>
          {purchaseAlert.message}
        </div>
      )}
    </section>
  )
}
