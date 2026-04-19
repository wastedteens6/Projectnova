import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../services/api'

interface CustomProject {
  id: string
  user_email: string
  project_name: string
  description: string
  technologies: string
  domain: string
  input_output: string
  deliverables?: string
  expected_deadline?: string
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
        body: JSON.stringify({ status: newStatus })
      })
      const data = await response.json()
      if (data.success) {
        setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus as any } : p))
        if (selectedProject?.id === id) {
          setSelectedProject({ ...selectedProject, status: newStatus as any })
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
      pending: isLight ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-900/30 text-yellow-400',
      reviewed: isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400',
      approved: isLight ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400',
      rejected: isLight ? 'bg-red-100 text-red-700' : 'bg-red-900/30 text-red-400'
    }
    return colors[status] || ''
  }

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
      {/* Header */}
      <div className={`border-b transition-all duration-300 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} pt-6 pb-6`}>
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Custom Project Requests
          </h1>
          <button
            onClick={() => navigate(-1)}
            title="Go back to previous page"
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              isLight 
                ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' 
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            <span>← Back</span>
          </button>
        </div>
      </div>

      <div className={`pt-12 pb-12 px-4 transition-all duration-300`}>
        <div className="container max-w-6xl mx-auto">

        <div className={`p-4 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-700'}`}>
          <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-600 text-white'
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className={`p-8 text-center ${isLight ? 'bg-slate-50' : 'bg-slate-900/50'}`}>Loading...</div>
          ) : projects.length === 0 ? (
            <div className={`p-8 text-center ${isLight ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
              No custom project requests found
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 rounded-lg border-2 cursor-pointer ${
                    selectedProject?.id === project.id
                      ? isLight
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-blue-900/30 border-blue-500'
                      : isLight
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-900/30 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{project.project_name}</h3>
                      <p className={isLight ? 'text-slate-600 text-sm' : 'text-slate-400 text-sm'}>
                        {project.user_email}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProject && (
          <div className={`mt-6 p-6 rounded-lg border-2 ${
            isLight ? 'bg-slate-50 border-blue-300' : 'bg-slate-900/50 border-blue-500'
          }`}>
            <h2 className="text-2xl font-bold mb-4">{selectedProject.project_name}</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {selectedProject.user_email}</p>
              <p><strong>Phone:</strong> {selectedProject.phone || 'N/A'}</p>
              <p><strong>Domain:</strong> {selectedProject.domain}</p>
              <p><strong>Budget:</strong> {selectedProject.budget || 'N/A'}</p>
              <p><strong>Description:</strong> {selectedProject.description}</p>
            </div>
            
            <div className={`mt-6 pt-4 flex flex-wrap gap-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
              <button 
                onClick={() => handleStatusUpdate(selectedProject.id, 'approved')} 
                disabled={selectedProject.status === 'approved'}
                className="px-5 py-2 font-bold rounded-lg text-sm bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve
              </button>
              
              <button 
                onClick={() => handleStatusUpdate(selectedProject.id, 'reviewed')} 
                disabled={selectedProject.status === 'reviewed'}
                className="px-5 py-2 font-bold rounded-lg text-sm bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reviewed
              </button>
              
              <button 
                onClick={() => handleStatusUpdate(selectedProject.id, 'rejected')} 
                disabled={selectedProject.status === 'rejected'}
                className="px-5 py-2 font-bold rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}
