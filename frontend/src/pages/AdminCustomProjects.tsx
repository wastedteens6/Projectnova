import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../services/api'

interface CustomProject {
  id: string
  user_email: string
  subject: string
  project_name: string // aliased from subject
  description: string
  technologies: string
  domain: string
  inputOutput: string
  deliverables?: string[]
  expectedDeadline?: string
  phone?: string
  budget?: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at: string
}

export default function AdminCustomProjects() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [projects, setProjects] = useState<CustomProject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<CustomProject | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    
    if (!token || userRole !== 'admin') {
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        const query = new URLSearchParams()
        if (statusFilter !== 'all') query.append('status', statusFilter)

        const response = await fetch(`${API_BASE_URL}/admin/custom-projects?${query.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setProjects(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [statusFilter])

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/custom-projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      })
      const data = await response.json()
      if (data.success) {
        setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus as any, admin_notes: adminNotes } : p))
        if (selectedProject?.id === id) {
          setSelectedProject({ ...selectedProject, status: newStatus as any, admin_notes: adminNotes })
        }
        alert('Status updated successfully')
      } else {
        alert(data.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Status update error:', err)
      alert('An error occurred while updating status')
    }
  }

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      pending: isLight ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-900/30 text-yellow-400',
      revived: isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400',
      approved: isLight ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400',
      rejected: isLight ? 'bg-red-100 text-red-700' : 'bg-red-900/30 text-red-400'
    }
    return colors[status] || ''
  }

  return (
    <div className={`min-h-screen pointer-events-none ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
      <div className={`pointer-events-auto border-b transition-all duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} pt-6 pb-6`}>
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Custom Project Requests
          </h1>
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              isLight ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="pointer-events-auto container max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        {/* Left Column: Filter & List */}
        <div className="md:col-span-1 space-y-6">
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-700'}`}>
            <label className="block text-sm font-bold mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600 text-white'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="revived">Revived</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 opacity-50">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 opacity-50">No requests found</div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project)
                    setAdminNotes(project.admin_notes || '')
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProject?.id === project.id
                      ? isLight ? 'bg-blue-50 border-blue-400 shadow-lg shadow-blue-200/50' : 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-900/20'
                      : isLight ? 'bg-slate-50 border-slate-100 hover:border-slate-200' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm line-clamp-1">{project.subject}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-50 mt-1">{project.user_email}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2">
          {selectedProject ? (
            <div className={`p-8 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black">{selectedProject.subject}</h2>
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">User Details</h4>
                  <p className="text-sm font-bold">{selectedProject.user_email}</p>
                  <p className="text-xs opacity-70">{selectedProject.phone || 'No phone provided'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Project Info</h4>
                  <p className="text-sm font-bold">{selectedProject.domain}</p>
                  <p className="text-xs opacity-70">Budget: {selectedProject.budget || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Description</h4>
                  <div className={`p-4 rounded-xl text-sm leading-relaxed ${isLight ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
                    {selectedProject.description}
                  </div>
                </div>

                {selectedProject.technologies && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedProject.technologies.split(',').map((tech, i) => (
                        <span key={i} className={`px-3 py-1 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Input/Output Details</h4>
                  <p className="text-sm">{selectedProject.inputOutput || 'N/A'}</p>
                </div>

                <div className="pt-6 border-t border-slate-800/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">Admin Response</h4>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter notes or feedback for the user..."
                    className={`w-full h-32 p-4 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
                    }`}
                  />
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button 
                      onClick={() => handleStatusUpdate(selectedProject.id, 'approved')}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      Approved
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedProject.id, 'revived')}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      Revived
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedProject.id, 'rejected')}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`h-full flex items-center justify-center p-12 rounded-2xl border-2 border-dashed ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/20'
            }`}>
              <div className="text-center opacity-50">
                <span className="text-4xl block mb-4">📄</span>
                <p className="font-bold">Select a request to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
