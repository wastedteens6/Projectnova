import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const formatted = path.startsWith('/') ? path : `/${path}`
  return `http://localhost:5000${formatted}`
}

export default function Projects() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [purchaseAlert, setPurchaseAlert] = useState({ show: false, message: '' })
  const [purchasedProjects, setPurchasedProjects] = useState<{ [key: string]: any }>({})

  useEffect(() => {
    axios.get('http://localhost:5000/api/projects')
      .then(res => setProjects(res.data.data || []))
      .catch(err => console.error('Error fetching projects:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const query = params.get('search')
    if (query) setSearchQuery(query)
  }, [])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedProjects') || '[]')
    const map: { [key: string]: any } = {}
    saved.forEach((p: any) => { if (p.id && p.date) map[p.id] = p })
    setPurchasedProjects(map)
  }, [])

  const isProjectPurchased = (id: string) => !!purchasedProjects[id]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    const newUrl = query ? `${window.location.pathname}?search=${encodeURIComponent(query)}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }

  const handleDownloadReceipt = (e: React.MouseEvent, project: any) => {
    e.preventDefault()
    const p = purchasedProjects[project.id]
    if (!p) return
    const content = `PURCHASE RECEIPT\n================\nProject: ${project.title}\nTier: ${p.tier || 'Tier 1'}\nDate: ${p.date}\nPrice: ${p.price}\n\nThank you!`
    const el = document.createElement('a')
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    el.setAttribute('download', `receipt_${project.slug}.txt`)
    el.style.display = 'none'
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
    setPurchaseAlert({ show: true, message: 'Receipt downloaded!' })
    setTimeout(() => setPurchaseAlert({ show: false, message: '' }), 3000)
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
      tierLevel: tier.level || 1, // Store level for matching
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
    window.location.href = `/projects/${project.slug}`
  }

  const handleUpgradePackage = (e: React.MouseEvent, project: any) => {
    e.preventDefault()
    e.stopPropagation()

    const currentTierData = purchasedProjects[project.id]
    if (!currentTierData) return

    // Find available tiers to upgrade to
    const currentTierIndex = project.tiers?.findIndex((t: any) => t.name === currentTierData.tier) ?? -1
    
    if (currentTierIndex === -1 || currentTierIndex === (project.tiers?.length || 0) - 1) {
      setPurchaseAlert({ show: true, message: 'Already at highest tier!' })
      return
    }

    // Show upgrade options or navigate to upgrade modal/page
    // For now, we'll create a simple upgrade modal showing available tiers
    const upgradeTiers = project.tiers?.slice(currentTierIndex + 1) || []
    
    if (upgradeTiers.length === 0) {
      setPurchaseAlert({ show: true, message: 'No higher tiers available' })
      return
    }

    // Store upgrade context and navigate to upgrade page
    const upgradeData = {
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      currentTier: currentTierData.tier,
      currentTierLevel: currentTierIndex,
      currentPrice: currentTierData.price,
      availableTiers: upgradeTiers
    }

    localStorage.setItem('upgradeContext', JSON.stringify(upgradeData))
    window.location.href = `/projects/${project.slug}?upgrade=true`
  }

  const categories = ['All', 'AI', 'ML', 'Web Development', 'Cybersecurity']

  const filteredProjects = projects.filter(project => {
    const matchCat = selectedCategory === 'All' || project.category === selectedCategory || project.techStack?.some((t: string) => t === selectedCategory)
    const matchSearch = !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  })

  if (loading) return (
    <div className={`min-h-screen pt-24 flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0a0a0f]'}`}>
      <div className="flex flex-col items-center gap-3">
        <div className={`w-7 h-7 border-2 border-t-transparent rounded-full animate-spin ${
          isLight ? 'border-indigo-600' : 'border-indigo-400'
        }`} />
        <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Loading projects...</span>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen pt-24 pb-16 ${isLight ? 'bg-white text-slate-900' : 'bg-[#0a0a0f] text-white'}`}>

      {/* Alert */}
      {purchaseAlert.show && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          isLight ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }`}>
          {purchaseAlert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* MARKETPLACE Header */}
        <div className="mb-3">
          <p className="text-sm font-bold tracking-wide text-red-500 uppercase">Marketplace</p>
        </div>

        {/* Page header */}
        <div className="mb-8">
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Browse Projects</h1>
          <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            4+ ready-made academic projects — pick, purchase, and build.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-12">
          {/* Search input */}
          <div className="relative flex-1 max-w-md mb-6">
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`w-full pl-12 pr-4 py-3 text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border-white/10 text-white placeholder-slate-600'
              }`}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-3 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isLight
                      ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AVAILABLE PROJECTS Header */}
        <div className="mb-8 flex items-center justify-between">
          <p className={`text-sm font-bold tracking-wide uppercase ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>Available Projects</p>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {filteredProjects.length} results
          </p>
        </div>

        {/* Projects grid - 2 columns */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project, idx) => {
              // Generate gradient colors for each card based on index
              const gradients = [
                'from-indigo-900/60 via-indigo-700/40 to-slate-900/60',
                'from-emerald-900/60 via-teal-700/40 to-slate-900/60',
                'from-rose-900/60 via-red-800/40 to-slate-900/60',
                'from-blue-900/60 via-cyan-700/40 to-slate-900/60',
                'from-purple-900/60 via-violet-700/40 to-slate-900/60',
                'from-orange-900/60 via-amber-700/40 to-slate-900/60'
              ]
              const gradient = gradients[idx % gradients.length]
              
              return (
                <div
                  key={project.id}
                  className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    isLight
                      ? 'bg-white border-slate-100 hover:border-slate-200'
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Thumbnail with gradient background and category badges overlay */}
                  <div className={`relative h-56 overflow-hidden group ${
                    isLight ? 'bg-gradient-to-br from-slate-100 to-slate-200' : `bg-gradient-to-br ${gradient}`
                  }`}>
                    {/* Background image or gradient placeholder */}
                    {(project.media?.images?.length > 0 || project.images?.length > 0) ? (
                      <img
                        src={getImageUrl((project.media?.images || project.images)[0])}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-40">
                        <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                      </div>
                    )}

                    {/* Category badges positioned at bottom left of image */}
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      {(project.tech_stack || []).slice(0, 2).map((tech: string, i: number) => (
                        <span
                          key={i}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md backdrop-blur-sm ${
                            isLight
                              ? 'bg-white/90 text-slate-700'
                              : 'bg-white/20 text-white border border-white/30'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Cart button at top right */}
                    <button
                      onClick={(e) => handleAddToCart(e, project)}
                      className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                        isLight
                          ? 'bg-white/90 text-slate-700 hover:bg-white'
                          : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                      }` }
                      title="Add to cart"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0h2m-2 0a2 2 0 110-4 2 2 0 010 4zm-8 0a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {/* Purchased badge if applicable */}
                    {isProjectPurchased(project.id) && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/50">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="text-xs font-semibold text-green-300">Purchased</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className={`p-6 ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
                    {/* Project Title */}
                    <h3 className={`text-xl font-bold mb-1 leading-snug group-hover:text-indigo-600 transition-colors ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {project.title}
                    </h3>

                    {/* Creator name - using category or placeholder */}
                    <p className={`text-sm mb-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {project.category || 'Academic Project'}
                    </p>

                    {/* CTA buttons row - full width for single button */}
                    <div className="flex gap-3 pt-4 border-t ${isLight ? 'border-slate-100' : 'border-white/10'}">
                      {isProjectPurchased(project.id) ? (
                        <>
                          <button
                            onClick={(e) => handleDownloadReceipt(e, project)}
                            className={`flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                              isLight
                                ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
                            }`}
                          >
                            Download Receipt
                          </button>
                          <button
                            onClick={(e) => handleUpgradePackage(e, project)}
                            className={`flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                              isLight
                                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                            title="Upgrade to a higher tier"
                          >
                            ⬆ Upgrade
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => handleBuyProject(e, project)}
                          className={`flex-1 font-semibold py-2.5 rounded-lg border transition-all duration-200 ${
                            isLight
                              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                              : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          Buy Project
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
            isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
          }`}>
            <div className="text-5xl mb-4">🔍</div>
            <p className={`text-lg font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>No projects found</p>
            <p className={`text-sm mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your search or category filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
