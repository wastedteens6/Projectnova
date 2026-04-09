'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useRouter, useParams } from 'next/navigation'

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

interface QuoteForm {
  quotedPrice: string
  breakdown: string
  deliveryDate: string
  validUntil: string
  notes: string
}

export default function CustomProjectDetail() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<CustomProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [sendingQuote, setSendingQuote] = useState(false)
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    quotedPrice: '',
    breakdown: '',
    deliveryDate: '',
    validUntil: '',
    notes: ''
  })

  // Load project from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('customProjects')
    if (stored) {
      const projects: CustomProject[] = JSON.parse(stored)
      const found = projects.find(p => p.id === projectId)
      if (found) {
        setProject(found)
      }
    }
    setLoading(false)
  }, [projectId])

  const updateProjectStatus = (newStatus: CustomProject['status']) => {
    if (!project) return

    const stored = localStorage.getItem('customProjects')
    if (stored) {
      const projects: CustomProject[] = JSON.parse(stored)
      const updated = projects.map(p =>
        p.id === projectId ? { ...p, status: newStatus } : p
      )
      localStorage.setItem('customProjects', JSON.stringify(updated))
      setProject({ ...project, status: newStatus })
    }
  }

  const handleSendQuote = async () => {
    if (!project) return

    if (!quoteForm.quotedPrice || !quoteForm.deliveryDate) {
      alert('Please fill in quoted price and delivery date')
      return
    }

    setSendingQuote(true)

    try {
      const response = await fetch('/api/admin/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerEmail: project.email,
          customerName: project.projectName,
          projectName: project.projectName,
          quotedPrice: quoteForm.quotedPrice,
          breakdown: quoteForm.breakdown,
          deliveryDate: quoteForm.deliveryDate,
          validUntil: quoteForm.validUntil,
          notes: quoteForm.notes
        })
      })

      if (response.ok) {
        updateProjectStatus('quoted')
        alert('Quote sent successfully to ' + project.email)
        setShowQuoteModal(false)
        setQuoteForm({
          quotedPrice: '',
          breakdown: '',
          deliveryDate: '',
          validUntil: '',
          notes: ''
        })
      } else {
        alert('Failed to send quote')
      }
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Error sending quote. See console for details.')
    } finally {
      setSendingQuote(false)
    }
  }

  const deleteProject = () => {
    if (!project) return
    const stored = localStorage.getItem('customProjects')
    if (stored) {
      const projects: CustomProject[] = JSON.parse(stored)
      const updated = projects.filter(p => p.id !== projectId)
      localStorage.setItem('customProjects', JSON.stringify(updated))
    }
    router.back()
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
      <span className={`px-4 py-2 rounded-full text-lg font-bold border ${config.bg} ${config.border} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 pb-20 px-4 transition-colors duration-300 ${
        isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
      }`}>
        <div className="container max-w-4xl mx-auto text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className={`min-h-screen pt-24 pb-20 px-4 transition-colors duration-300 ${
        isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
      }`}>
        <div className="container max-w-4xl mx-auto text-center">
          <p className="text-xl mb-4">Project not found</p>
          <button
            onClick={() => router.back()}
            className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${
              isLight
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-colors duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`mb-6 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
            isLight
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          ← Back to Projects
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>{project.projectName}</h1>
              <p className={`text-lg transition-colors duration-300 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>Request ID: {project.id}</p>
            </div>
            {getStatusBadge(project.status)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className={`p-6 rounded-xl border transition-all duration-300 ${
              isLight
                ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-300/50'
                : 'bg-slate-900/50 border-slate-700'
            }`}>
              <h2 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Project Description</h2>
              <p className={`transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>{project.description}</p>
            </div>

            {/* Technical Details */}
            <div className={`p-6 rounded-xl border transition-all duration-300 ${
              isLight
                ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-300/50'
                : 'bg-slate-900/50 border-slate-700'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Technical Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-bold block mb-2 transition-colors duration-300 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Domain</label>
                  <p className={`text-lg transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>{project.domain}</p>
                </div>

                <div>
                  <label className={`text-sm font-bold block mb-2 transition-colors duration-300 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Technologies</label>
                  <p className={`text-lg transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>{project.technologies}</p>
                </div>

                <div>
                  <label className={`text-sm font-bold block mb-2 transition-colors duration-300 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Input/Output Requirements</label>
                  <p className={`text-lg transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>{project.inputOutput}</p>
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div className={`p-6 rounded-xl border transition-all duration-300 ${
              isLight
                ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-300/50'
                : 'bg-slate-900/50 border-slate-700'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Required Deliverables</h2>
              
              <div className="flex flex-wrap gap-3">
                {project.deliverables.map(d => (
                  <span key={d} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-300 ${
                    isLight
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-purple-900/30 text-purple-300'
                  }`}>
                    {d === 'ppt' && '📊 PowerPoint'}
                    {d === 'report' && '📄 Report'}
                    {d === 'paper' && '📑 Research Paper'}
                    {d === 'source' && '💻 Source Code'}
                    {d === 'documentation' && '📚 Documentation'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Timeline */}
            <div className={`p-6 rounded-xl border transition-all duration-300 ${
              isLight
                ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-300/50'
                : 'bg-slate-900/50 border-slate-700'
            }`}>
              <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Timeline</h3>
              
              <div className="space-y-3">
                <div>
                  <p className={`text-sm font-bold transition-colors duration-300 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>Submitted</p>
                  <p className={`text-lg transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>{new Date(project.createdAt).toLocaleDateString()} {new Date(project.createdAt).toLocaleTimeString()}</p>
                </div>

                <div>
                  <p className={`text-sm font-bold transition-colors duration-300 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>Expected Deadline</p>
                  <p className={`text-lg transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>{new Date(project.expectedDeadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className={`p-6 rounded-xl border transition-all duration-300 ${
              isLight
                ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-300/50'
                : 'bg-slate-900/50 border-slate-700'
            }`}>
              <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Customer Contact</h3>
              
              <div className="space-y-3">
                <div>
                  <p className={`text-sm font-bold transition-colors duration-300 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>Email</p>
                  <a href={`mailto:${project.email}`} className={`text-lg font-semibold transition-colors duration-300 ${
                    isLight ? 'text-purple-600 hover:text-purple-700' : 'text-cyan-400 hover:text-cyan-300'
                  }`}>
                    {project.email}
                  </a>
                </div>

                <div>
                  <p className={`text-sm font-bold transition-colors duration-300 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>Phone</p>
                  <a href={`tel:${project.phone}`} className={`text-lg font-semibold transition-colors duration-300 ${
                    isLight ? 'text-purple-600 hover:text-purple-700' : 'text-cyan-400 hover:text-cyan-300'
                  }`}>
                    {project.phone}
                  </a>
                </div>

                <div>
                  <p className={`text-sm font-bold transition-colors duration-300 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>Budget Expectation</p>
                  <p className={`text-lg transition-colors duration-300 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>{project.budget || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="w-full px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg"
              >
                💰 Send Quote
              </button>
              <button
                onClick={() => updateProjectStatus('approved')}
                className="w-full px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 bg-green-600 text-white hover:bg-green-700"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => updateProjectStatus('rejected')}
                className="w-full px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 bg-red-600 text-white hover:bg-red-700"
              >
                ✕ Reject
              </button>
              <button
                onClick={() => updateProjectStatus('pending')}
                className={`w-full px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 border-2 ${
                  isLight
                    ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50'
                    : 'border-yellow-600 text-yellow-400 hover:bg-yellow-900/20'
                }`}
              >
                ⏱ Mark Pending
              </button>
              <button
                onClick={deleteProject}
                className={`w-full px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 border-2 ${
                  isLight
                    ? 'border-red-300 text-red-600 hover:bg-red-50'
                    : 'border-red-600 text-red-400 hover:bg-red-900/20'
                }`}
              >
                🗑 Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isLight ? 'bg-white' : 'bg-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>Send Custom Quote</h2>
              <button
                onClick={() => setShowQuoteModal(false)}
                className={`text-2xl transition-colors duration-300 ${
                  isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>Quoted Price (₹) *</label>
                <input
                  type="text"
                  placeholder="e.g., 15,000 or 15,000 - 20,000"
                  value={quoteForm.quotedPrice}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quotedPrice: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                    isLight
                      ? 'border-purple-300/50 bg-white text-slate-900'
                      : 'border-slate-600 bg-slate-800/50 text-white'
                  } placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>Price Breakdown</label>
                <textarea
                  placeholder="e.g., Backend Development: ₹8,000 | Frontend: ₹5,000 | Testing & Docs: ₹2,000"
                  value={quoteForm.breakdown}
                  onChange={(e) => setQuoteForm({ ...quoteForm, breakdown: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                    isLight
                      ? 'border-purple-300/50 bg-white text-slate-900'
                      : 'border-slate-600 bg-slate-800/50 text-white'
                  } placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                  } resize-none`}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Expected Delivery Date *</label>
                  <input
                    type="date"
                    value={quoteForm.deliveryDate}
                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                      isLight
                        ? 'border-purple-300/50 bg-white text-slate-900'
                        : 'border-slate-600 bg-slate-800/50 text-white'
                    } focus:outline-none focus:ring-2 ${
                      isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>Quote Valid Until</label>
                  <input
                    type="date"
                    value={quoteForm.validUntil}
                    onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                      isLight
                        ? 'border-purple-300/50 bg-white text-slate-900'
                        : 'border-slate-600 bg-slate-800/50 text-white'
                    } focus:outline-none focus:ring-2 ${
                      isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>Additional Notes</label>
                <textarea
                  placeholder="Any terms, conditions, or additional information for the customer"
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 ${
                    isLight
                      ? 'border-purple-300/50 bg-white text-slate-900'
                      : 'border-slate-600 bg-slate-800/50 text-white'
                  } placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                  } resize-none`}
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowQuoteModal(false)
                  setQuoteForm({
                    quotedPrice: '',
                    breakdown: '',
                    deliveryDate: '',
                    validUntil: '',
                    notes: ''
                  })
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-bold border transition-all duration-300 ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSendQuote}
                disabled={sendingQuote}
                className="flex-1 px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg disabled:opacity-50"
              >
                {sendingQuote ? 'Sending...' : '📧 Send Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
