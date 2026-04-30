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
  const dk = theme !== 'light'
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/admin/projects/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setProjects(res.data.data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      const token = localStorage.getItem('token')
      if (!token) return alert('You must be logged in as an admin')

      const res = await axios.delete(`http://localhost:5000/api/admin/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.data.success) fetchProjects()
    } catch (err: any) {
      alert('Failed to delete project: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleToggleFeatured = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return alert('You must be logged in as an admin')

      const res = await axios.put(`http://localhost:5000/api/admin/projects/${id}/toggle-featured`, {}, { headers: { Authorization: `Bearer ${token}` } })
      if (res.data.success) fetchProjects()
    } catch (err: any) {
      alert('Failed to toggle featured status: ' + (err.response?.data?.error || err.message))
    }
  }

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'

  return (
    <div className={`min-h-screen pointer-events-none ${surface}`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">Manage Projects</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>{projects.length} Total</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >← Back</button>
            <button
              onClick={() => navigate('/admin/projects/create')}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1.5"
            >
              + Add Project
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 pointer-events-auto">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className={`text-xs ${muted}`}>Loading projects…</span>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project: any) => (
              <div key={project.id} className={`rounded-xl border overflow-hidden flex flex-col transition-all hover:-translate-y-1 ${cardBg}`}>
                
                {/* Image Thumbnail */}
                <div className={`h-36 overflow-hidden relative group ${dk ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  {((project.media?.images?.length > 0) || (project.images?.length > 0)) ? (
                    <img
                      src={getImageUrl((project.media?.images?.[0]) || (project.images?.[0]))}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-50">
                      <div className="text-3xl">📦</div>
                      <div className="text-[10px]">No image</div>
                    </div>
                  )}
                  {project.is_featured && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-0.5 rounded text-[9px] font-black tracking-widest shadow-lg uppercase">
                      Featured
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-sm font-bold leading-tight truncate" title={project.title}>{project.title}</h3>
                    <span className="text-[10px] font-black text-emerald-500 whitespace-nowrap">₹{project.tiers?.[0]?.price || 'N/A'}</span>
                  </div>
                  <p className={`text-[10px] font-medium mb-3 uppercase tracking-wider ${muted}`}>{project.category}</p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1 mb-auto">
                    {(project.tech_stack || []).slice(0, 3).map((tech: string, i: number) => (
                      <span key={i} className={`px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/15 text-purple-400`}>
                        {tech}
                      </span>
                    ))}
                    {(project.tech_stack || []).length > 3 && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${dk ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        +{project.tech_stack.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`mt-4 pt-3 border-t flex gap-1.5 ${border}`}>
                    <button
                      onClick={() => handleToggleFeatured(project.id)}
                      className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold transition border ${
                        project.is_featured 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20' 
                          : dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >⭐</button>
                    <button
                      onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                      className={`flex-[3] px-2 py-1.5 rounded text-[10px] font-bold transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className={`flex-[3] px-2 py-1.5 rounded text-[10px] font-bold transition border ${dk ? 'border-red-900/30 text-red-400 hover:bg-red-900/50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                    >Delete</button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-2xl border ${cardBg}`}>
            <p className={`text-sm ${muted}`}>No projects found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
