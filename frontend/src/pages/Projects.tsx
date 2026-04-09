import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const TIER_PRICES = { tier1: 499, tier2: 999, tier3: 1999 }

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

      <div className="container max-w-6xl mx-auto px-4 sm:px-6">

        {/* Page header */}
        <div className="mb-10">
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Browse Projects</h1>
          <p className={`text-base ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {projects.length}+ ready-made academic projects
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isLight ? 'text-slate-400' : 'text-slate-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`w-full pl-9 pr-4 py-2 text-sm rounded-[10px] border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border-white/10 text-white placeholder-slate-600'
              }`}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-[10px] text-sm font-medium border transition-all duration-150 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isLight
                      ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <a
                key={project.id}
                href={`/projects/${project.slug}`}
                className={`group rounded-[14px] border overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
                  isLight
                    ? 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                    : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* Thumbnail */}
                <div className={`h-44 overflow-hidden ${
                  isLight ? 'bg-slate-100' : 'bg-white/5'
                }`}>
                  {(project.media?.images?.length > 0 || project.images?.length > 0) ? (
                    <img
                      src={getImageUrl((project.media?.images || project.images)[0])}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-4xl ${
                      isLight ? 'bg-slate-100' : 'bg-white/[0.03]'
                    }`}>
                      📦
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(project.tech_stack || []).slice(0, 3).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          isLight
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                    {(project.tech_stack || []).length > 3 && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-500'
                      }`}>
                        +{(project.tech_stack || []).length - 3}
                      </span>
                    )}
                  </div>

                  <h3 className={`font-semibold text-base mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors ${
                    isLight ? 'text-slate-900' : 'text-white group-hover:text-indigo-400'
                  }`}>
                    {project.title}
                  </h3>

                  <p className={`text-sm line-clamp-2 mb-4 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {project.description}
                  </p>

                  {/* Price + CTA row */}
                  <div className="flex items-center justify-between pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/[0.06]'}">
                    <div>
                      <span className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        ₹{project.tiers?.[0]?.price || TIER_PRICES.tier1}
                      </span>
                      <span className={`text-xs ml-1 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>from</span>
                    </div>

                    {isProjectPurchased(project.id) ? (
                      <button
                        onClick={(e) => handleDownloadReceipt(e, project)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isLight
                            ? 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}
                      >
                        Download Receipt
                      </button>
                    ) : (
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        isLight
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20'
                      }`}>
                        View tiers →
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 rounded-[14px] border ${
            isLight ? 'border-slate-100 bg-slate-50' : 'border-white/[0.06] bg-white/[0.02]'
          }`}>
            <div className="text-4xl mb-3">🔍</div>
            <p className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>No projects found</p>
            <p className={`text-sm mt-1 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No projects in this category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
