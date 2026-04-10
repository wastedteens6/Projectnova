import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const formatted = path.startsWith('/') ? path : `/${path}`
  return `http://localhost:5000${formatted}`
}

export default function AdminProjects() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [projects, setProjects] = useState([])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  const fetchProjects = async () => {
    try {
      // Use admin endpoint to get all projects including unpublished
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/admin/projects/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      console.log('===== PROJECTS RESPONSE =====')
      console.log('Projects count:', res.data.data?.length)
      res.data.data?.forEach((p: any, idx: number) => {
        console.log(`\n[${idx}] ${p.title}`)
        console.log('  - media:', p.media)
        console.log('  - media.images:', p.media?.images)
        console.log('  - First image:', p.media?.images?.[0])
        if (p.media?.images?.[0]) {
          const url = getImageUrl(p.media.images[0])
          console.log('  - Full URL:', url)
        }
      })
      console.log('=============================\n')
      setProjects(res.data.data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      // Fallback to public endpoint
      try {
        const res = await axios.get('http://localhost:5000/api/projects')
        setProjects(res.data.data || [])
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr)
      }
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('You must be logged in as an admin')
          return
        }

        const res = await axios.delete(`http://localhost:5000/api/admin/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (res.data.success) {
          alert('Project deleted successfully!')
          fetchProjects()
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error'
        alert('Failed to delete project: ' + errorMsg)
        console.error('Delete error:', err)
      }
    }
  }

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('You must be logged in as an admin')
        return
      }

      const res = await axios.put(
        `http://localhost:5000/api/admin/projects/${id}/toggle-featured`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      if (res.data.success) {
        alert(res.data.message || 'Featured status updated!')
        fetchProjects()
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error'
      alert('Failed to toggle featured status: ' + errorMsg)
      console.error('Toggle featured error:', err)
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
      {/* Header */}
      <div className={`border-b transition-all duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Manage Projects</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-semibold transition-all bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Projects ({projects.length})</h2>
          <button
            onClick={() => navigate('/admin/projects/create')}
            className="px-6 py-2 rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white"
          >
            + Add New Project
          </button>
        </div>

        {/* Project Cards Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className={`rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-all ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                {/* Image Thumbnail */}
                <div className={`h-48 overflow-hidden relative group ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>
                  {(project.media?.images?.length > 0) ? (
                    <div className="relative w-full h-full">
                      <img
                        src={getImageUrl(project.media.images[0])}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const url = getImageUrl(project.media.images[0])
                          console.error(`❌ Image failed to load: ${url}`, {
                            src: e.currentTarget.src,
                            error: e.error
                          })
                          e.currentTarget.style.display = 'none'
                        }}
                        onLoad={() => {
                          const url = getImageUrl(project.media.images[0])
                          console.log(`✅ Image loaded: ${url}`)
                        }}
                        onLoadStart={() => {
                          const url = getImageUrl(project.media.images[0])
                          console.log(`⏳ Image loading: ${url}`)
                        }}
                      />
                      {/* Fallback if image fails */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-gray-600 hidden"
                        id={`fallback-${project.id}`}
                      >
                        Failed to load image
                      </div>
                    </div>
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>
                      <div className="text-5xl">📦</div>
                      <div className="text-xs text-slate-500 px-2">No images</div>
                    </div>
                  )}
                  {/* Featured Badge */}
                  {project.is_featured && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Featured
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className={`text-lg font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {project.title}
                  </h3>
                  <p className={`text-sm mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
                              : 'bg-purple-900 text-purple-200'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Price: ₹{project.tiers?.[0]?.price || 'N/A'}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!project.id) {
                            alert('Invalid project ID')
                            return
                          }
                          navigate(`/admin/projects/edit/${project.id}`)
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                          isLight
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                          isLight
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleFeatured(project.id, project.is_featured)}
                      className={`w-full px-3 py-2 rounded-lg font-semibold transition-all ${
                        project.is_featured
                          ? `${isLight ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`
                          : `${isLight ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white`
                      }`}
                    >
                      {project.is_featured ? '⭐ Unfeature' : '☆ Feature Project'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-lg ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
            <p className={`text-lg ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              No projects yet. Create one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
