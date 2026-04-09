import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../services/api'

const domains = [
  'Artificial Intelligence', 'Machine Learning', 'Web Development',
  'Mobile Development', 'Cybersecurity', 'Data Science',
  'Cloud Computing', 'Blockchain', 'IoT', 'Other'
]

const deliverableOptions = [
  { id: 'ppt', label: 'PowerPoint Presentation' },
  { id: 'report', label: 'Project Report' },
  { id: 'paper', label: 'Research Paper' },
  { id: 'source', label: 'Source Code' },
  { id: 'documentation', label: 'Documentation' },
]

const fieldClass = (error: boolean, isLight: boolean) =>
  `w-full px-3 py-2.5 text-sm rounded-[10px] border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
    error
      ? 'border-red-400 bg-red-50 text-red-900'
      : isLight
        ? 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
        : 'border-white/10 bg-white/5 text-white placeholder-slate-600'
  } ${error && !isLight ? 'border-red-500/60 bg-red-500/10 text-red-300' : ''}`

export default function CustomProjectForm() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    projectName: '', description: '', technologies: '', domain: '',
    inputOutput: '', deliverables: [] as string[],
    expectedDeadline: '', email: '', phone: '', budget: ''
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.projectName.trim()) e.projectName = 'Project name is required'
    if (!formData.description.trim()) e.description = 'Description is required'
    if (!formData.technologies.trim()) e.technologies = 'Please specify technologies'
    if (!formData.domain) e.domain = 'Please select a domain'
    if (!formData.inputOutput.trim()) e.inputOutput = 'Input/Output requirements are required'
    if (formData.deliverables.length === 0) e.deliverables = 'Select at least one deliverable'
    if (!formData.expectedDeadline) e.expectedDeadline = 'Deadline is required'
    if (!formData.email.trim() || !formData.email.includes('@')) e.email = 'Valid email is required'
    if (!formData.phone.trim()) e.phone = 'Phone number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCheckbox = (id: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.includes(id)
        ? prev.deliverables.filter(d => d !== id)
        : [...prev.deliverables, id]
    }))
    if (errors.deliverables) setErrors(prev => ({ ...prev, deliverables: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/custom-projects/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userEmail: formData.email })
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setTimeout(() => {
          setFormData({ projectName: '', description: '', technologies: '', domain: '', inputOutput: '', deliverables: [], expectedDeadline: '', email: '', phone: '', budget: '' })
          setSubmitted(false)
        }, 4000)
      } else {
        setErrors({ submit: data.message || 'Submission failed. Please try again.' })
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const labelClass = `block text-sm font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`
  const errorClass = 'text-red-500 text-xs mt-1'

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 ${isLight ? 'bg-white text-slate-900' : 'bg-[#0a0a0f] text-white'}`}>
      <div className="container max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Custom Project Request
          </h1>
          <p className={`text-base ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Fill in your requirements and we'll get back with a quote within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div className={`rounded-[14px] border p-10 text-center ${
            isLight ? 'bg-green-50 border-green-100' : 'bg-green-500/5 border-green-500/20'
          }`}>
            <div className="text-5xl mb-4">✅</div>
            <h2 className={`text-xl font-bold mb-2 ${isLight ? 'text-green-800' : 'text-green-400'}`}>Request Submitted!</h2>
            <p className={`text-sm ${isLight ? 'text-green-700' : 'text-green-500'}`}>
              We'll review your request and contact you within 24 hours with a quote and timeline.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section: Project Details */}
            <div className={`rounded-[14px] border p-6 ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/[0.03] border-white/[0.06]'}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                Project Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Name <span className="text-red-400">*</span></label>
                  <input type="text" name="projectName" value={formData.projectName} onChange={handleChange}
                    placeholder="e.g., AI Chatbot System"
                    className={fieldClass(!!errors.projectName, isLight)} />
                  {errors.projectName && <p className={errorClass}>{errors.projectName}</p>}
                </div>

                <div>
                  <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    placeholder="Describe your project — features, problem it solves, target users..."
                    rows={4} className={`${fieldClass(!!errors.description, isLight)} resize-none`} />
                  {errors.description && <p className={errorClass}>{errors.description}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Domain <span className="text-red-400">*</span></label>
                    <select name="domain" value={formData.domain} onChange={handleChange}
                      className={fieldClass(!!errors.domain, isLight)}>
                      <option value="">Select domain...</option>
                      {domains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.domain && <p className={errorClass}>{errors.domain}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Deadline <span className="text-red-400">*</span></label>
                    <input type="date" name="expectedDeadline" value={formData.expectedDeadline} onChange={handleChange}
                      className={fieldClass(!!errors.expectedDeadline, isLight)} />
                    {errors.expectedDeadline && <p className={errorClass}>{errors.expectedDeadline}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Technologies / Stack <span className="text-red-400">*</span></label>
                  <input type="text" name="technologies" value={formData.technologies} onChange={handleChange}
                    placeholder="e.g., Python, React, Node.js, MongoDB"
                    className={fieldClass(!!errors.technologies, isLight)} />
                  {errors.technologies && <p className={errorClass}>{errors.technologies}</p>}
                </div>

                <div>
                  <label className={labelClass}>Input / Output Requirements <span className="text-red-400">*</span></label>
                  <textarea name="inputOutput" value={formData.inputOutput} onChange={handleChange}
                    placeholder="What inputs does the project take? What outputs/results does it produce?"
                    rows={3} className={`${fieldClass(!!errors.inputOutput, isLight)} resize-none`} />
                  {errors.inputOutput && <p className={errorClass}>{errors.inputOutput}</p>}
                </div>
              </div>
            </div>

            {/* Section: Deliverables */}
            <div className={`rounded-[14px] border p-6 ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/[0.03] border-white/[0.06]'}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                Required Deliverables <span className="text-red-400">*</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {deliverableOptions.map(opt => (
                  <label key={opt.id} className={`flex items-center gap-3 px-4 py-3 rounded-[10px] cursor-pointer border transition-all ${
                    formData.deliverables.includes(opt.id)
                      ? isLight
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                        : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/10'
                  }`}>
                    <input type="checkbox" checked={formData.deliverables.includes(opt.id)}
                      onChange={() => handleCheckbox(opt.id)}
                      className="accent-indigo-600 w-4 h-4" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.deliverables && <p className={`${errorClass} mt-2`}>{errors.deliverables}</p>}
            </div>

            {/* Section: Contact */}
            <div className={`rounded-[14px] border p-6 ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/[0.03] border-white/[0.06]'}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                Contact Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="your@email.com"
                    className={fieldClass(!!errors.email, isLight)} />
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone <span className="text-red-400">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+91-XXXXXXXXXX"
                    className={fieldClass(!!errors.phone, isLight)} />
                  {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Budget <span className={`text-xs font-normal ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>(optional)</span></label>
                  <input type="text" name="budget" value={formData.budget} onChange={handleChange}
                    placeholder="e.g., ₹5,000 – ₹10,000 or leave blank for a quote"
                    className={fieldClass(false, isLight)} />
                </div>
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className={`rounded-[10px] border px-4 py-3 text-sm ${
                isLight ? 'bg-red-50 border-red-100 text-red-700' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg flex-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Request'}
              </button>
              <button type="button" disabled={loading}
                onClick={() => { setFormData({ projectName: '', description: '', technologies: '', domain: '', inputOutput: '', deliverables: [], expectedDeadline: '', email: '', phone: '', budget: '' }); setErrors({}) }}
                className={`btn btn-lg ${isLight ? 'btn-secondary' : 'btn-secondary'}`}>
                Clear
              </button>
            </div>

            {/* How it works */}
            <div className={`rounded-[14px] border p-5 ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.02] border-white/[0.04]'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>How it works</p>
              <ol className={`space-y-2 text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {['Submit your requirements via this form', 'We review and respond within 24 hours with a quote', 'Confirm the quote and we start building', 'Receive regular updates throughout development', 'Get all deliverables as specified'].map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`text-xs font-bold mt-0.5 ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`}>{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
