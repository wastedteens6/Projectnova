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

export default function ProjectDetail() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { slug } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [purchaseAlert, setPurchaseAlert] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/projects/${slug}`)
        if (res.data.success) {
          // Backend returns { success: true, data: project }
          const projectData = res.data.data
          setProject(projectData)
          // Default to first tier if available
          if (projectData.tiers && projectData.tiers.length > 0) {
            setSelectedTier(projectData.tiers[0].level)
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
      setPurchaseAlert({ show: true, message: 'Please login to purchase!', type: 'error' })
      setTimeout(() => navigate('/auth/login'), 2000)
      return
    }

    if (!project) return

    // Add to cart so that the Checkout page displays it properly
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({
        id: project.id,
        name: project.title,
        tier: tierName,
        price: tierPrice,
        slug: project.slug,
        driveLink: driveLink || '#'
    })
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Redirect to checkout
    navigate('/checkout')
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

  const currentTierData: Tier | undefined = project.tiers?.find((t: Tier) => t.level === selectedTier)

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = 'http://localhost:5000';
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${formattedPath}`;
  };

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      {/* Purchase Alert */}
      {purchaseAlert.show && (
        <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg z-50 animate-pulse border transition-all duration-300 ${
          purchaseAlert.type === 'error'
            ? 'bg-red-500/20 border-red-500/50 text-red-300'
            : isLight
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-green-500/20 border-green-500/50 text-green-300'
        }`}>
          {purchaseAlert.message}
        </div>
      )}

      <div className="container max-w-6xl mx-auto">
        {/* Main Content Area */}
        <div className="space-y-12 mb-16">
          {/* Header / Hero */}
          <div className="space-y-6">
              <div className={`aspect-video max-w-4xl mx-auto rounded-3xl border overflow-hidden flex items-center justify-center transition-all duration-300 ${
                  isLight ? 'bg-slate-100 border-slate-200 shadow-xl shadow-purple-200/20' : 'bg-slate-900 border-slate-700/50 shadow-2xl'
              }`}>
                  {project.media?.images?.length > 0 ? (
                      <img src={getImageUrl(project.media.images[0])} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                      <div className="text-8xl">🚀</div>
                  )}
              </div>
              
              <div className="text-center max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight mb-6">
                      {project.title}
                  </h1>
                  
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                          isLight ? 'bg-purple-100 border-purple-200 text-purple-600' : 'bg-purple-900/30 border-purple-600 text-purple-300'
                      }`}>
                          {project.category}
                      </span>
                      {project.tech_stack?.map(tech => (
                          <span key={tech} className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                              {tech}
                          </span>
                      ))}
                  </div>

                  <p className={`text-xl leading-relaxed transition-colors duration-300 ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                      {project.description}
                  </p>
              </div>
          </div>

          {/* Features Section */}
          {(project.features?.length > 0) && (
            <div className={`backdrop-blur-lg border rounded-3xl p-8 lg:p-10 max-w-5xl mx-auto transition-all duration-300 ${
                isLight ? 'border-slate-200 bg-slate-50/40 shadow-xl shadow-purple-200/20' : 'border-slate-700/50 bg-slate-900/40'
            }`}>
              <h2 className={`text-3xl font-black mb-8 flex justify-center items-center gap-3 transition-colors duration-300 ${
                isLight ? 'text-purple-600' : 'text-cyan-400'
              }`}>
                <span>✨</span> Core Features
              </h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                {project.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className={`mt-1 p-1 rounded-full transition-all duration-300 ${
                      isLight ? 'bg-purple-100 text-purple-600' : 'bg-cyan-900/30 text-cyan-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-lg font-medium transition-colors duration-300 ${
                      isLight ? 'text-slate-700' : 'text-slate-200'
                    }`}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Tiers Section */}
        <div id="tiers" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Select Your License
              </span>
            </h2>
            <p className={`text-xl transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Choose the perfect tier for this project and get instant access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {project.tiers?.map((tier, i) => {
              const Icon = i === 0 ? '🚀' : i === 1 ? '⭐' : '🎯';
              const isHighlight = i === 1;
              const colorClass = i === 0 ? 'from-blue-600 to-cyan-600' : i === 1 ? 'from-purple-600 to-pink-600' : 'from-cyan-600 to-blue-600';

              return (
                <div
                  key={tier.level}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                    isHighlight
                      ? 'border-transparent md:scale-105 md:z-10'
                      : isLight
                        ? 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Gradient Border */}
                  {isHighlight && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-20 blur`}></div>
                  )}

                  {/* Card Container */}
                  <div className={`relative z-10 p-8 h-full rounded-2xl transition-all duration-300 ${
                    isHighlight
                      ? isLight
                        ? 'bg-gradient-to-br from-slate-50/95 to-slate-100/95 border-2 border-gradient-to-r from-purple-500 to-cyan-500'
                        : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-2 border-gradient-to-r from-purple-500 to-cyan-500'
                      : isLight
                        ? 'bg-slate-50/50 backdrop-blur'
                        : 'bg-slate-900/50 backdrop-blur'
                  }`}>
                    {/* Icon */}
                    <div className="text-5xl mb-4">{Icon}</div>

                    {/* Tier Name */}
                    <h3 className={`text-2xl font-black capitalize mb-6 group-hover:text-cyan-400 transition duration-300 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>{tier.name || `Level ${tier.level}`}</h3>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-5xl font-black transition-colors duration-300 ${isHighlight ? 'text-transparent bg-gradient-to-r ' + colorClass + ' bg-clip-text' : isLight ? 'text-slate-900' : 'text-white'}`}>
                          ₹{tier.price || 499}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePurchase(tier.level, tier.price || 499, tier.name || `Level ${tier.level}`, tier.drive_link)}
                      className={`w-full py-3 rounded-lg font-bold mb-8 transition transform hover:scale-105 duration-300 ${
                        isHighlight
                          ? 'bg-gradient-to-r ' + colorClass + ' text-white shadow-lg shadow-purple-500/50 hover:shadow-lg hover:shadow-purple-500/50'
                          : isLight
                            ? 'border border-slate-300 text-slate-900 hover:border-purple-600 hover:text-purple-600'
                            : 'border border-slate-600 text-slate-200 hover:border-cyan-500 hover:text-cyan-400'
                      }`}
                    >
                      Get Access Now
                    </button>

                    {/* Features List */}
                    <div className={`p-4 rounded-xl transition duration-300 ${isLight ? 'bg-slate-100/50' : 'bg-slate-800/40'}`}>
                      <p className={`text-sm font-bold uppercase tracking-widest mb-4 transition-colors duration-300 ${
                          isLight ? 'text-slate-500' : 'text-slate-500'
                      }`}>Includes:</p>
                      <ul className="space-y-4">
                        {(tier.features || []).map((feature, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <span className={`font-bold mt-1 flex-shrink-0 transition-colors duration-300 ${
                              isLight ? 'text-purple-600' : 'text-cyan-400'
                            }`}>✓</span>
                            <span className={`text-sm font-medium transition duration-300 ${
                              isLight ? 'text-slate-700' : 'text-slate-300'
                            }`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
