'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'

interface CustomProject {
  id: string
  projectName: string
  description: string
  technologies: string
  domain: string
  inputOutput: string
  deliverables: string[]
  expectedDeadline: string
  email: string
  phone: string
  budget: string
  status: 'pending' | 'approved' | 'rejected' | 'quoted'
  createdAt: string
}

export default function AdminCustomProjects() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const router = useRouter()
  const [projects, setProjects] = useState<CustomProject[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'quoted'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('customProjects')
    if (stored) {
      setProjects(JSON.parse(stored))
    }
  }, [])

  // Mock data for demonstration
  useEffect(() => {
    if (projects.length === 0) {
      const mockProjects: CustomProject[] = [
        {
          id: '1',
          projectName: 'AI Chatbot System',
          description: 'Build a conversational AI chatbot using NLP for customer support',
          technologies: 'Python, TensorFlow, Flask, React',
          domain: 'Artificial Intelligence',
          inputOutput: 'Takes user queries as input, outputs intelligent responses with confidence scores',
          deliverables: ['ppt', 'report', 'source'],
          expectedDeadline: '2026-05-15',
          email: 'student1@example.com',
          phone: '+91-9876543210',
          budget: '₹5,000 - ₹8,000',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
      setProjects(mockProjects)
    }
  }, [])

  const filteredProjects = projects.filter(project => {
    const statusMatch = filterStatus === 'all' || project.status === filterStatus
    const searchMatch = 
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.email.toLowerCase().includes(searchTerm.toLowerCase())
    return statusMatch && searchMatch
  })

  const updateProjectStatus = (id: string, newStatus: 'pending' | 'approved' | 'rejected' | 'quoted') => {
    const updated = projects.map(p => p.id === id ? { ...p, status: newStatus } : p)
    setProjects(updated)
    localStorage.setItem('customProjects', JSON.stringify(updated))
  }

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id)
    setProjects(updated)
    localStorage.setItem('customProjects', JSON.stringify(updated))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: isLight ? 'bg-yellow-50' : 'bg-yellow-900/20', border: 'border-yellow-300', text: isLight ? 'text-yellow-700' : 'text-yellow-400' },
      approved: { bg: isLight ? 'bg-green-50' : 'bg-green-900/20', border: 'border-green-300', text: isLight ? 'text-green-700' : 'text-green-400' },
      rejected: { bg: isLight ? 'bg-red-50' : 'bg-red-900/20', border: 'border-red-300', text: isLight ? 'text-red-700' : 'text-red-400' },
      quoted: { bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20', border: 'border-blue-300', text: isLight ? 'text-blue-700' : 'text-blue-400' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${config.bg} ${config.border} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-colors duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Custom Project Requests</h1>
          <p className={`transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>Click on any project to view full details and send customized pricing quotes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Full Width Projects List */}
          <div className="lg:col-span-3">
            {/* Filter and Search */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'quoted', 'approved', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      filterStatus === status
                        ? isLight
                          ? 'bg-purple-600 text-white'
                          : 'bg-cyan-600 text-white'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} 
                    {status !== 'all' && ` (${projects.filter(p => p.status === status).length})`}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search by project name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                  isLight
                    ? 'border-purple-300/50 bg-white text-slate-900'
                    : 'border-slate-600 bg-slate-800/50 text-white'
                } placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                }`}
              />
            </div>

            {/* Projects List */}
            <div className="space-y-3">
              {filteredProjects.length === 0 ? (
                <div className={`p-8 rounded-xl text-center transition-all duration-300 ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-500'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400'
                }`}>
                  <p className="text-lg font-medium">No requests found</p>
                </div>
              ) : (
                filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/admin/custom-projects/${project.id}`)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                      isLight
                        ? 'border-slate-200 bg-white hover:border-purple-400 hover:shadow-lg hover:bg-purple-50/30'
                        : 'border-slate-700 bg-slate-800/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 group-hover:text-purple-600 ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>{project.projectName}</h3>
                        <p className={`text-sm transition-colors duration-300 ${
                          isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}>{project.email}</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          isLight ? 'text-slate-500' : 'text-slate-500'
                        }`}>{project.domain}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(project.status)}
                        <span className={`text-xs font-bold transition-colors duration-300 ${
                          isLight ? 'text-purple-600 group-hover:text-purple-700' : 'text-cyan-400 group-hover:text-cyan-300'
                        }`}>View →</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
