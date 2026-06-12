import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

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
  const dk = theme !== 'light'
  const [projects, setProjects] = useState<CustomProject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<CustomProject | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    const fetchProjects = async () => {
      try {
        const query = new URLSearchParams()
        if (statusFilter !== 'all') query.append('status', statusFilter)

        const res = await api.get(`/admin/custom-projects?${query.toString()}`)
        const data = res.data
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
    try {
      const res = await api.patch(`/admin/custom-projects/${id}`, { status: newStatus, adminNotes })
      const data = res.data
      if (data.success) {
        setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus as any, admin_notes: adminNotes } : p))
        if (selectedProject?.id === id) {
          setSelectedProject({ ...selectedProject, status: newStatus as any, admin_notes: adminNotes })
        }
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
      pending: dk ? 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      revived: dk ? 'bg-blue-500/15 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200',
      approved: dk ? 'bg-green-500/15 text-green-500 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200',
      rejected: dk ? 'bg-red-500/15 text-red-500 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[status] || ''
  }

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'
  const inputBg  = dk ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-400'

  return (
    <div className={`min-h-screen pointer-events-none ${surface}`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">Custom Project Requests</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>{projects.length} Total</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >← Back</button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="pointer-events-auto max-w-screen-xl mx-auto px-6 py-6 grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Filter & List */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className={`p-4 rounded-xl border flex flex-col gap-2 ${cardBg}`}>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-md border outline-none transition ${inputBg}`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="revived">Revived</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className={`rounded-xl border flex flex-col overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto ${cardBg}`}>
            {loading ? (
              <div className={`text-center py-8 text-xs ${muted}`}>Loading...</div>
            ) : projects.length === 0 ? (
              <div className={`text-center py-8 text-xs ${muted}`}>No requests found</div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project)
                    setAdminNotes(project.admin_notes || '')
                  }}
                  className={`p-3 border-b last:border-b-0 cursor-pointer transition-all ${border} ${
                    selectedProject?.id === project.id
                      ? dk ? 'bg-purple-500/10' : 'bg-purple-50'
                      : dk ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-xs line-clamp-1">{project.subject}</h3>
                    <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className={`text-[10px] truncate ${muted}`}>{project.user_email}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-8">
          {selectedProject ? (
            <div className={`p-6 rounded-2xl border flex flex-col gap-6 ${cardBg}`}>
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold">{selectedProject.subject}</h2>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border ${dk ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${muted}`}>User Details</h4>
                  <p className="text-xs font-semibold">{selectedProject.user_email}</p>
                  <p className={`text-[10px] mt-0.5 ${muted}`}>{selectedProject.phone || 'No phone provided'}</p>
                </div>
                <div className={`p-3 rounded-lg border ${dk ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Project Info</h4>
                  <p className="text-xs font-semibold">{selectedProject.domain}</p>
                  <p className={`text-[10px] mt-0.5 ${muted}`}>Budget: {selectedProject.budget || 'N/A'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Description</h4>
                  <div className={`p-3 rounded-lg border text-xs leading-relaxed ${dk ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    {selectedProject.description}
                  </div>
                </div>

                {selectedProject.technologies && (
                  <div>
                    <h4 className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Technologies</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProject.technologies.split(',').map((tech, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded border text-[10px] font-medium ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${muted}`}>Input/Output Details</h4>
                  <p className="text-xs">{selectedProject.inputOutput || 'N/A'}</p>
                </div>

                <div className={`pt-4 border-t ${border}`}>
                  <h4 className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${muted}`}>Admin Response</h4>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter notes or feedback for the user..."
                    className={`w-full h-24 p-3 rounded-lg border text-xs outline-none transition ${inputBg}`}
                  />
                  
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleStatusUpdate(selectedProject.id, 'approved')}
                      className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition border ${dk ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                    >Approve</button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedProject.id, 'revived')}
                      className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition border ${dk ? 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
                    >Revive</button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedProject.id, 'rejected')}
                      className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition border ${dk ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                    >Reject</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`h-full min-h-[300px] flex items-center justify-center p-8 rounded-2xl border border-dashed ${dk ? 'border-slate-800 bg-slate-900/20' : 'border-slate-300 bg-slate-50'}`}>
              <div className={`text-center ${muted}`}>
                <span className="text-3xl block mb-2 opacity-50">📄</span>
                <p className="text-xs font-bold">Select a request to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
