import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../services/api'

export default function CustomProjectForm() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    technologies: '',
    domain: '',
    inputOutput: '',
    deliverables: [],
    expectedDeadline: '',
    email: '',
    phone: '',
    budget: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const domains = [
    'Artificial Intelligence',
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'Cybersecurity',
    'Data Science',
    'Cloud Computing',
    'Blockchain',
    'IoT',
    'Other'
  ]

  const deliverableOptions = [
    { id: 'ppt', label: 'PowerPoint Presentation' },
    { id: 'report', label: 'Project Report' },
    { id: 'paper', label: 'Research Paper' },
    { id: 'source', label: 'Source Code' },
    { id: 'documentation', label: 'Documentation' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }
    if (!formData.technologies.trim()) {
      newErrors.technologies = 'Please specify technologies'
    }
    if (!formData.domain) {
      newErrors.domain = 'Please select a domain'
    }
    if (!formData.inputOutput.trim()) {
      newErrors.inputOutput = 'Input/Output requirements are required'
    }
    if (formData.deliverables.length === 0) {
      newErrors.deliverables = 'Please select at least one deliverable'
    }
    if (!formData.expectedDeadline) {
      newErrors.expectedDeadline = 'Expected deadline is required'
    } else {
      const selectedDate = new Date(formData.expectedDeadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.expectedDeadline = 'Deadline cannot be in the past'
      }
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCheckboxChange = (deliverableId: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.includes(deliverableId)
        ? prev.deliverables.filter(id => id !== deliverableId)
        : [...prev.deliverables, deliverableId]
    }))
    if (errors.deliverables) {
      setErrors(prev => ({
        ...prev,
        deliverables: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/custom-projects/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userEmail: formData.email,
          projectName: formData.projectName,
          description: formData.description,
          technologies: formData.technologies,
          domain: formData.domain,
          inputOutput: formData.inputOutput,
          deliverables: formData.deliverables,
          expectedDeadline: formData.expectedDeadline,
          phone: formData.phone,
          budget: formData.budget
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('Form submitted successfully:', data)
        setSubmitted(true)

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            projectName: '',
            description: '',
            technologies: '',
            domain: '',
            inputOutput: '',
            deliverables: [],
            expectedDeadline: '',
            email: '',
            phone: '',
            budget: ''
          })
          setSubmitted(false)
        }, 3000)
      } else {
        setErrors({ submit: data.message || 'Failed to submit form' })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ submit: 'Failed to submit form. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-colors duration-300 pointer-events-none ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-4xl mx-auto pointer-events-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold mb-4 transition-colors duration-300 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Custom Project Request</h1>
          <p className={`text-xl transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>Tell us about your project and we'll build it for you! Fill out the form below with your requirements.</p>
        </div>

        {submitted ? (
          <div className={`p-8 rounded-xl text-center transition-all duration-300 ${
            isLight
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
              : 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-500/50'
          }`}>
            <div className="text-6xl mb-4">✅</div>
            <h2 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isLight ? 'text-green-700' : 'text-green-400'
            }`}>Request Submitted Successfully!</h2>
            <p className={`text-lg transition-colors duration-300 ${
              isLight ? 'text-green-600' : 'text-green-300'
            }`}>We'll review your request and contact you within 24 hours with a quote and timeline.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`p-8 rounded-xl border transition-all duration-300 ${
            isLight
              ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-300/50'
              : 'bg-slate-900/50 border-slate-700'
          }`}>
            {/* Project Name */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Project Name *
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="e.g., AI Chatbot System, E-commerce Platform"
                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                  errors.projectName
                    ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                    : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                } ${isLight ? 'text-slate-900' : 'text-white'} placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                }`}
              />
              {errors.projectName && <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                What Do You Want? (Detailed Description) *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project in detail. What features do you need? What problem does it solve?"
                rows={5}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                  errors.description
                    ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                    : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                } ${isLight ? 'text-slate-900' : 'text-white'} placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                } resize-none`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Technologies */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Technologies/Stack (Comma Separated) *
              </label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleInputChange}
                placeholder="e.g., Python, React, Node.js, MongoDB, TensorFlow"
                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                  errors.technologies
                    ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                    : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                } ${isLight ? 'text-slate-900' : 'text-white'} placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                }`}
              />
              {errors.technologies && <p className="text-red-500 text-sm mt-1">{errors.technologies}</p>}
            </div>

            {/* Domain */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Domain *
              </label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                  errors.domain
                    ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                    : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                } ${isLight ? 'text-slate-900' : 'text-white'} focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                }`}
              >
                <option value="">Select a domain...</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
            </div>

            {/* Input/Output */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Input/Output Requirements *
              </label>
              <textarea
                name="inputOutput"
                value={formData.inputOutput}
                onChange={handleInputChange}
                placeholder="Describe what inputs your project takes and what outputs it should produce. Example: 'Takes user images, outputs classification results with confidence scores'"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                  errors.inputOutput
                    ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                    : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                } ${isLight ? 'text-slate-900' : 'text-white'} placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                } resize-none`}
              />
              {errors.inputOutput && <p className="text-red-500 text-sm mt-1">{errors.inputOutput}</p>}
            </div>

            {/* Deliverables */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-4 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Required Deliverables *
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {deliverableOptions.map(option => (
                  <label key={option.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                    formData.deliverables.includes(option.id)
                      ? isLight ? 'bg-purple-50 border-purple-400' : 'bg-purple-900/20 border-purple-500'
                      : isLight ? 'bg-white border-purple-300/30' : 'bg-slate-800/30 border-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.deliverables.includes(option.id)}
                      onChange={() => handleCheckboxChange(option.id)}
                      className="w-5 h-5 cursor-pointer accent-purple-600"
                    />
                    <span className={`font-medium transition-colors duration-300 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.deliverables && <p className="text-red-500 text-sm mt-2">{errors.deliverables}</p>}
            </div>

            {/* Expected Deadline */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Expected Deadline *
              </label>
              <input
                type="date"
                name="expectedDeadline"
                min={new Date().toISOString().split('T')[0]}
                value={formData.expectedDeadline}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                  errors.expectedDeadline
                    ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                    : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                } ${isLight ? 'text-slate-900' : 'text-white'} focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                }`}
              />
              {errors.expectedDeadline && <p className="text-red-500 text-sm mt-1">{errors.expectedDeadline}</p>}
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Estimated Budget (Optional)
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., ₹5,000 - ₹10,000 or Leave blank for quote"
                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                  isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                } ${isLight ? 'text-slate-900' : 'text-white'} placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                }`}
              />
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Email */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                    errors.email
                      ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                      : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                  } ${isLight ? 'text-slate-900' : 'text-white'} placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91-XXXXXXXXXX"
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border ${
                    errors.phone
                      ? isLight ? 'border-red-500 bg-red-50' : 'border-red-500 bg-red-900/20'
                      : isLight ? 'border-purple-300/50 bg-white' : 'border-slate-600 bg-slate-800/50'
                  } ${isLight ? 'text-slate-900' : 'text-white'} placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    isLight ? 'focus:ring-purple-500' : 'focus:ring-cyan-500'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex-1 px-8 py-4 font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className={`absolute inset-0 rounded-lg blur group-hover:blur-md transition duration-300 opacity-75 group-hover:opacity-100 ${
                  isLight
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}></div>
                <div className={`relative px-8 py-4 rounded-lg transition-colors duration-300 ${
                  isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
                }`}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setFormData({
                    projectName: '',
                    description: '',
                    technologies: '',
                    domain: '',
                    inputOutput: '',
                    deliverables: [],
                    expectedDeadline: '',
                    email: '',
                    phone: '',
                    budget: ''
                  })
                  setErrors({})
                }}
                className={`px-8 py-4 font-bold text-lg rounded-lg border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLight
                    ? 'border-purple-300 text-purple-600 hover:bg-purple-50'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Clear Form
              </button>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className={`mt-4 p-4 rounded-lg border-2 ${
                isLight
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-red-900/20 border-red-500/50 text-red-400'
              }`}>
                {errors.submit}
              </div>
            )}
          </form>
        )}

        {/* Info Box */}
        <div className={`mt-12 p-6 rounded-xl border transition-all duration-300 ${
          isLight
            ? 'bg-purple-50/50 border-purple-200 text-slate-700'
            : 'bg-slate-900/50 border-slate-700 text-slate-300'
        }`}>
          <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${
            isLight ? 'text-purple-700' : 'text-purple-400'
          }`}>📋 How It Works:</h3>
          <ul className="space-y-2">
            <li>✓ Fill out the form with your project requirements</li>
            <li>✓ We'll review your request within 24 hours</li>
            <li>✓ Receive a detailed quote and project timeline</li>
            <li>✓ Confirm and we'll start building immediately</li>
            <li>✓ Get regular updates throughout development</li>
            <li>✓ Receive all deliverables as specified</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
