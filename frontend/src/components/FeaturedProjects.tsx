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

  useEffect(() => {
    fetchFeaturedProjects()
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
      <div className="container max-w-6xl mx-auto">
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

        {/* Featured Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.slug}`)}
              className={`rounded-lg border overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                isLight
                  ? 'bg-white border-purple-200 hover:border-purple-400'
                  : 'bg-slate-800 border-purple-700 hover:border-purple-500'
              }`}
            >
              {/* Image Thumbnail with Badge */}
              <div className={`h-48 overflow-hidden relative group`}>
                {project.media?.images?.length > 0 ? (
                  <img
                    src={getImageUrl(project.media.images[0])}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>
                    <div className="text-5xl">📦</div>
                  </div>
                )}
                {/* Featured Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Featured
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className={`text-lg font-bold mb-2 group-hover:text-purple-600 transition-colors ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {project.title}
                </h3>
                
                <p className={`text-sm mb-3 truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {project.description}
                </p>

                <p className={`text-xs mb-3 font-medium ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                  {project.category}
                </p>

                {/* Tech Stack */}
                {project.tech_stack && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(project.tech_stack || []).slice(0, 3).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          isLight
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-purple-900/50 text-purple-200'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className={`text-lg font-bold ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                  ₹{project.tiers?.[0]?.price || 'Contact'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
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
    </section>
  )
}
