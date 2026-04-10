import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'

interface Tier {
  level: string
  name: string
  price: number
  features: string[]
  drive_link?: string
}

interface Project {
  id: number
  slug: string
  title: string
  description: string
  category: string
  tech_stack: string[]
  features: string[]
  tiers: Tier[]
  media: { images: string[]; videos: string[] }
}

const getImageUrl = (path?: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const baseUrl = 'http://localhost:5000'
  const formattedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${formattedPath}`
}

export default function ProjectDetail() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { slug } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'video' | 'images'>('images')
  const [purchaseAlert, setPurchaseAlert] = useState({ show: false, message: '', type: 'success' })
  const [isUpgrade, setIsUpgrade] = useState(false)
  const [upgradeContext, setUpgradeContext] = useState<any>(null)
  const [upgradeDifference, setUpgradeDifference] = useState(0)

  useEffect(() => {
    // Check if this is an upgrade flow
    const params = new URLSearchParams(window.location.search)
    const upgradeParam = params.get('upgrade')
    if (upgradeParam === 'true') {
      const saved = localStorage.getItem('upgradeContext')
      if (saved) {
        const context = JSON.parse(saved)
        setIsUpgrade(true)
        setUpgradeContext(context)
      }
    }

    const fetchProject = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/projects/${slug}`)
        if (res.data.success) {
          const projectData = res.data.data
          setProject(projectData)
          if (projectData.tiers && projectData.tiers.length > 0) {
            // If upgrading, select the first available upgrade tier
            if (upgradeParam === 'true') {
              const saved = localStorage.getItem('upgradeContext')
              if (saved) {
                const context = JSON.parse(saved)
                const upgradeableIndex = context.currentTierLevel + 1
                if (projectData.tiers[upgradeableIndex]) {
                  setSelectedTier(projectData.tiers[upgradeableIndex].level)
                  // Calculate difference
                  const difference = projectData.tiers[upgradeableIndex].price - context.currentPrice
                  setUpgradeDifference(difference > 0 ? difference : 0)
                }
              }
            } else {
              setSelectedTier(projectData.tiers[0].level)
            }
          }
        } else {
          setError('Failed to load project details.')
        }
      } catch (err: any) {
        const msg = err?.response?.data?.error || 'Project not found or failed to load.'
        setError(msg)
        console.error('ProjectDetail fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [slug])

  const handlePurchase = (tierLevel: string, tierPrice: number, tierName: string, driveLink?: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setPurchaseAlert({ show: true, message: 'Please login to add to cart!', type: 'error' })
      setTimeout(() => navigate('/auth/login'), 2000)
      return
    }

    if (!project) return

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    if (isUpgrade && upgradeContext) {
      // For upgrades, add as upgrade cart item
      cart.push({
        id: project.id,
        name: project.title,
        tier: tierName,
        tierLevel: currentTierData?.level, // Store level for matching
        price:upgradeDifference, // Only charge the difference
        originalPrice: tierPrice, // Store full price for reference
        slug: project.slug,
        driveLink: driveLink || '#',
        isUpgrade: true,
        upgradedFrom: upgradeContext.currentTier,
        upgradedFromPrice: upgradeContext.currentPrice
      })
      setPurchaseAlert({ show: true, message: `✅ Upgrade added to cart! Total to pay: ₹${upgradeDifference}`, type: 'success' })
    } else {
      // Regular purchase
      cart.push({
        id: project.id,
        name: project.title,
        tier: tierName,
        tierLevel: parseInt(tierLevel), // Store level for matching
        price: tierPrice,
        slug: project.slug,
        driveLink: driveLink || '#'
      })
      setPurchaseAlert({ show: true, message: `✅ Added to cart! Continue shopping or go to checkout.`, type: 'success' })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    localStorage.removeItem('upgradeContext') // Clear upgrade context after adding to cart
    
    setTimeout(() => setPurchaseAlert({ show: false, message: '', type: 'success' }), 3000)
  }

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center pt-20 ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )

  if (error || !project) return (
    <div className={`min-h-screen flex flex-col items-center justify-center pt-20 ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
      <p className="text-2xl font-bold mb-4">{error || 'Project not found'}</p>
      <button onClick={() => navigate('/projects')} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Back to Browse</button>
    </div>
  )

  const currentTierData = project.tiers?.find((t: Tier) => t.level === selectedTier)
  const hasVideo = project.media?.videos && project.media.videos.length > 0
  const hasImages = project.media?.images && project.media.images.length > 0

  return (
    <div className={`min-h-screen pt-24 pb-20 transition-colors duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      {/* Purchase Alert */}
      {purchaseAlert.show && (
        <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg z-50 border transition-all duration-300 ${
          purchaseAlert.type === 'error'
            ? 'bg-red-500/20 border-red-500/50 text-red-300'
            : isLight
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-green-500/20 border-green-500/50 text-green-300'
        }`}>
          {purchaseAlert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/projects')} className={`mb-6 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-900'
        }`}>
          ← Back to Projects
        </button>

        {/* Main Layout: Gallery Left + Sidebar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Image Gallery & Media */}
          <div className="lg:col-span-2">
            {/* Main Image / Video */}
            <div className={`rounded-2xl overflow-hidden border mb-4 transition-all duration-300 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {activeTab === 'video' && hasVideo ? (
                <video
                  src={getImageUrl(project.media.videos[0])}
                  className="w-full aspect-video object-cover"
                  controls
                  controlsList="nodownload"
                />
              ) : hasImages ? (
                <img
                  src={getImageUrl(project.media.images[selectedImageIndex])}
                  alt={project.title}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center text-6xl">📦</div>
              )}
            </div>

            {/* Tab switching for video/images */}
            {hasVideo && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === 'images'
                      ? isLight ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                      : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  📸 Images
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === 'video'
                      ? isLight ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                      : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  🎬 Video
                </button>
              </div>
            )}

            {/* Image Thumbnails */}
            {activeTab === 'images' && hasImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {project.media.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-purple-500 scale-105'
                        : isLight ? 'border-slate-200' : 'border-slate-700'
                    }`}
                  >
                    <img src={getImageUrl(project.media.images[idx])} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">About this project</h2>
              <p className={`text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {project.description}
              </p>
            </div>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`text-xl mt-1 flex-shrink-0 ${
                        isLight ? 'text-purple-600' : 'text-cyan-400'
                      }`}>✓</span>
                      <span className={`${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map(tech => (
                    <span
                      key={tech}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                        isLight
                          ? 'bg-purple-100 border-purple-200 text-purple-700'
                          : 'bg-purple-900/30 border-purple-600 text-purple-300'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar - Pricing & Info */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl border p-6 sticky top-24 transition-all duration-300 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {/* Category Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  isLight
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-purple-900/30 text-purple-300'
                }`}>
                  {project.category}
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-2xl font-black mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {project.title}
              </h1>

              {/* Upgrade Header (if applicable) */}
              {isUpgrade && upgradeContext && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  isLight
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-amber-900/20 border-amber-700/50 text-amber-200'
                }`}>
                  <p className="text-sm font-bold mb-2">📦 Current Package</p>
                  <p className="font-semibold">{upgradeContext.currentTier} - ₹{upgradeContext.currentPrice}</p>
                </div>
              )}

              {/* Pricing Section */}
              <div className="space-y-4 border-t border-b py-6 mb-6">
                {project.tiers?.map((tier, i) => {
                  // If upgrading, disable tiers at or below current tier
                  const isCurrentTierOrLower = isUpgrade && upgradeContext && i <= upgradeContext.currentTierLevel
                  const isHigherTier = !isCurrentTierOrLower
                  
                  return (
                    <label
                      key={tier.level}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                        isCurrentTierOrLower
                          ? isLight
                            ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
                            : 'bg-slate-800 border-slate-700 cursor-not-allowed opacity-50'
                          : selectedTier === tier.level
                            ? isLight ? 'border-purple-500 bg-purple-50 cursor-pointer' : 'border-purple-500 bg-purple-900/20 cursor-pointer'
                            : isLight ? 'border-slate-200 hover:border-slate-300 cursor-pointer' : 'border-slate-700 hover:border-slate-600 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={tier.level}
                        checked={selectedTier === tier.level}
                        onChange={(e) => {
                          setSelectedTier(parseInt(e.target.value))
                          // Update upgrade difference if applicable
                          if (isUpgrade && upgradeContext) {
                            const difference = tier.price - upgradeContext.currentPrice
                            setUpgradeDifference(Math.max(0, difference))
                          }
                        }}
                        disabled={isCurrentTierOrLower}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-bold">{tier.name || `Tier ${i + 1}`}</div>
                        <div className={`text-2xl font-black ${
                          isUpgrade && isHigherTier
                            ? 'text-amber-600'
                            : 'text-purple-600'
                        }`}>
                          {isUpgrade && isHigherTier && selectedTier === tier.level
                            ? `₹${Math.max(0, tier.price - upgradeContext.currentPrice)}` 
                            : `₹${tier.price}`
                          }
                        </div>
                        <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isCurrentTierOrLower ? 'Current package' : `${(tier.features || []).length} features included`}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Selected Tier Features */}
              {currentTierData && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Includes:</h3>
                  <ul className="space-y-2">
                    {(currentTierData.features || []).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handlePurchase(currentTierData?.level || '', currentTierData?.price || 0, currentTierData?.name || '', currentTierData?.drive_link)}
                className={`w-full font-bold py-3 rounded-lg transition-all transform hover:scale-105 mb-3 ${
                  isUpgrade
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white'
                }`}
              >
                {isUpgrade 
                  ? `Upgrade to ${currentTierData?.name} - ₹${upgradeDifference}`
                  : 'Add to Cart'
                }
              </button>

              <button
                onClick={() => {
                  if (isUpgrade) {
                    handlePurchase(currentTierData?.level || '', currentTierData?.price || 0, currentTierData?.name || '', currentTierData?.drive_link)
                    setTimeout(() => navigate(`/checkout?itemId=${project.id}`), 1000)
                  } else {
                    // Add item to cart first, then go to checkout with itemId filter
                    handlePurchase(currentTierData?.level || '', currentTierData?.price || 0, currentTierData?.name || '', currentTierData?.drive_link)
                    setTimeout(() => navigate(`/checkout?itemId=${project.id}`), 500)
                  }
                }}
                className={`w-full py-3 rounded-lg font-bold border-2 transition-all ${
                  isLight
                    ? 'border-purple-600 text-purple-600 hover:bg-purple-50'
                    : 'border-purple-500 text-purple-400 hover:bg-purple-900/20'
                }`}
              >
                {isUpgrade ? `Proceed to Checkout (₹${upgradeDifference})` : '💳 Buy Now'}
              </button>

              {/* Additional Info */}
              <div className={`mt-6 pt-6 border-t space-y-3 text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <div className="flex items-center gap-2">
                  <span>📥</span>
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>♾️</span>
                  <span>Lifetime Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure Purchase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
