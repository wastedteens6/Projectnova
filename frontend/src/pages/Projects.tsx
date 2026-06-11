import api from '../lib/api';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { HiOutlineShoppingCart, HiArrowUpCircle, HiArrowDownTray, HiMagnifyingGlass } from 'react-icons/hi2'

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const formatted = path.startsWith('/') ? path : `/${path}`
  return `${import.meta.env.VITE_API_URL||'http://localhost:5000'}${formatted}`
}

export default function Projects() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [purchaseAlert, setPurchaseAlert] = useState({ show: false, message: '' })
  const [purchasedProjects, setPurchasedProjects] = useState<{ [key: string]: any }>({})

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedComplexity, setSelectedComplexity] = useState<string[]>([])

  useEffect(() => {
    api.get(/api/projects')
      .then(res => setProjects(res.data.data || []))
      .catch(err => console.error('Error fetching projects:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const query = params.get('search')
    if (query) setSearchQuery(query)

    // Handle tech parameter (from homepage tech cards)
    const tech = params.get('tech')
    if (tech) {
      // Map tech parameter to category filters
      const techMap: { [key: string]: string } = {
        'Python': 'AI/ML',
        'Java': 'Web Dev',
        'Web': 'Web Dev',
        'Cloud': 'Web Dev',
        'Cybersecurity': 'Cybersecurity',
        'Blockchain': 'Web Dev',
        'IoT': 'IoT',
        'AI': 'AI/ML'
      }
      const category = techMap[tech]
      if (category) {
        setSelectedCategories([category])
      }
    }
  }, [])

  useEffect(() => {
    // CRITICAL FIX: Fetch purchased projects from API (not localStorage)
    // This ensures we get the correct user's data based on JWT token
    const token = localStorage.getItem('token')
    if (!token) {
      // User not logged in - no purchases
      setPurchasedProjects({})
      return
    }

    // Fetch authenticated user's purchases from backend
    api.get(/api/purchases/my-purchases', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        // Transform purchased projects array into map for quick lookup
        const map: { [key: string]: any } = {}
        res.data.purchases?.forEach((p: any) => {
          map[p.project_id] = {
            tier: p.tier_name,
            tierLevel: p.tier_level,
            date: new Date(p.created_at).toLocaleDateString(),
            price: `₹${p.price_in_paise / 100}`,
            priceInPaise: p.price_in_paise, // Store raw numeric price for upgrade calculation
            transactionId: p.transaction_id
          }
        })
        setPurchasedProjects(map)
      })
      .catch(err => {
        console.error('Error fetching purchased projects:', err)
        setPurchasedProjects({})
      })
  }, [localStorage.getItem('token')])

  const isProjectPurchased = (id: string) => !!purchasedProjects[id]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleComplexityToggle = (complexity: string) => {
    setSelectedComplexity(prev =>
      prev.includes(complexity)
        ? prev.filter(c => c !== complexity)
        : [...prev, complexity]
    )
  }

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

  const handleBuyProject = (e: React.MouseEvent, project: any) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/projects/${project.slug}`)
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

  if (loading) return (
    <div className={`min-h-screen pt-24 flex items-center justify-center bg-transparent`}>
      <div className="flex flex-col items-center gap-3">
        <div className={`w-7 h-7 border-2 border-t-transparent rounded-full animate-spin ${
          isLight ? 'border-indigo-600' : 'border-indigo-400'
        }`} />
        <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Loading projects...</span>
      </div>
    </div>
  )

  const categories = ['AI/ML', 'Web Dev', 'IoT', 'Mobile App', 'Cybersecurity']
  const complexityLevels = ['Beginner', 'Intermediate', 'Advanced']

  // Map project category to filter category
  const getCategoryForProject = (project: any) => {
    const category = project.category || ''
    if (category.includes('AI') || category.includes('ML')) return 'AI/ML'
    if (category.includes('Web')) return 'Web Dev'
    if (category.includes('IoT')) return 'IoT'
    if (category.includes('Mobile')) return 'Mobile App'
    if (category.includes('Security') || category.includes('Cyber')) return 'Cybersecurity'
    return null
  }

  // Determine complexity level based on tier count
  const getComplexityForProject = (project: any) => {
    const tierCount = project.tiers?.length || 1
    if (tierCount <= 2) return 'Beginner'
    if (tierCount === 3) return 'Intermediate'
    return 'Advanced'
  }

  const filteredProjects = projects.filter(project => {
    // Search filter
    const matchSearch = !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tech_stack?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    // Category filter
    const projectCategory = getCategoryForProject(project)
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(projectCategory)

    // Complexity filter
    const projectComplexity = getComplexityForProject(project)
    const matchComplexity = selectedComplexity.length === 0 || selectedComplexity.includes(projectComplexity)

    return matchSearch && matchCategory && matchComplexity
  })

  return (
    <div className={`min-h-screen pt-24 pb-16 w-full pointer-events-none ${isLight ? 'text-slate-900 bg-transparent' : 'text-white bg-transparent'}`}>

      {/* Alert */}
      {purchaseAlert.show && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg pointer-events-auto ${
          isLight ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }`}>
          {purchaseAlert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Browse Projects</h1>
          <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            4+ ready-made academic projects — pick, purchase, and build.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for projects (e.g., 'Traffic Management', 'React')..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`w-full pl-12 pr-4 py-3 text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border-white/10 text-white placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Content: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR - FILTERS */}
          <div className={`rounded-2xl border p-6 h-fit sticky top-24 ${
            isLight 
              ? 'bg-white border-slate-200' 
              : 'bg-slate-900/40 border-slate-700/50'
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>Filters</h3>

            {/* Category Filter */}
            <div className="mb-8">
              <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>Category</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className={`w-4 h-4 rounded accent-indigo-600 cursor-pointer ${
                        isLight ? 'accent-indigo-600' : ''
                      }`}
                    />
                    <span className={`text-sm transition-colors group-hover:font-medium ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Complexity Filter */}
            <div>
              <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wide ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>Complexity</h4>
              <div className="space-y-2">
                {complexityLevels.map(level => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedComplexity.includes(level)}
                      onChange={() => handleComplexityToggle(level)}
                      className={`w-4 h-4 rounded accent-indigo-600 cursor-pointer ${
                        isLight ? 'accent-indigo-600' : ''
                      }`}
                    />
                    <span className={`text-sm transition-colors group-hover:font-medium ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}>{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - PROJECTS GRID */}
          <div className="lg:col-span-3">
            {/* Results header */}
            <div className="mb-6">
              <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </p>
            </div>

            {/* Projects Grid - 3 columns */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, idx) => {
                  const categoryLabel = getCategoryForProject(project)
                  const complexityLabel = getComplexityForProject(project)
                  const rating = 4.5 // Default rating for now
                  const minPrice = Math.min(...(project.tiers?.map((t: any) => t.price) || [0]))

                  return (
                    <div
                      key={project.id}
                      className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-100 hover:border-slate-200'
                          : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                      onClick={(e) => {
                        if (!(e.target as any).closest('button')) {
                          navigate(`/projects/${project.slug}`)
                        }
                      }}
                    >
                      {/* Image Container */}
                      <div className={`relative h-48 overflow-hidden ${
                        isLight ? 'bg-slate-100' : 'bg-slate-800'
                      }`}>
                        {(project.media?.images?.length > 0 || project.images?.length > 0) ? (
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
                            className={`p-2.5 rounded-full transition-all duration-200 shadow-lg ${
                              isLight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-slate-800 text-indigo-400 hover:bg-slate-700'
                            }`}
                            title="Add to Cart"
                          >
                            <HiOutlineShoppingCart className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Category Badge */}
                        {categoryLabel && (
                          <div className="absolute top-3 left-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide ${
                              isLight
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-700/60 text-slate-200'
                            }`}>
                              {categoryLabel}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`p-5 ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
                        {/* Title */}
                        <h3 className={`font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors ${
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
                                  : 'bg-slate-800/60 text-slate-300'
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
                                className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold text-sm hover:scale-105 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                title="Upgrade to a higher tier"
                              >
                                <HiArrowUpCircle className="w-4 h-4" /> Upgrade
                              </button>
                              <button
                                onClick={(e) => handleDownloadReceipt(e, project)}
                                className="px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:scale-105 transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                                title="Download purchase receipt"
                              >
                                <HiArrowDownTray className="w-4 h-4" /> Receipt
                              </button>
                            </div>
                          ) : (
                            // Show Buy Now button for non-purchased projects
                            <button
                              onClick={(e) => handleBuyProject(e, project)}
                              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-base hover:scale-105 transition shadow-lg shadow-purple-500/30"
                              title="Buy this project directly"
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
            ) : (
              <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-700/50 bg-slate-900/20'
              }`}>
                <div className="text-5xl mb-4 flex justify-center">
                  <HiMagnifyingGlass className="opacity-40" />
                </div>
                <p className={`text-lg font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>No projects found</p>
                <p className={`text-sm mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Try adjusting your search or filter options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
