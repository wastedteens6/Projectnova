import api from '../lib/api';
import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Support() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/support/tickets', { subject, message })
      setSuccess('Support ticket created successfully!')
      setSubject('')
      setMessage('')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError('Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    { q: 'How do I access my purchased projects?', a: 'After purchase, visit your dashboard and download the project files. You will have lifetime access.' },
    { q: 'What if I need help with setup?', a: 'Our support team is available 24/7. Create a ticket here and we will assist you promptly.' },
    { q: 'Can I get a refund?', a: 'Yes, 30-day money-back guarantee if you are not satisfied with your purchase.' },
    { q: 'Do you offer custom projects?', a: 'Yes! Contact our team for custom development and project requirements.' }
  ]

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 pointer-events-none ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-4xl mx-auto pointer-events-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Support
            </span>
          </h1>
          <p className={`transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>Get help with your projects</p>
        </div>
        
        <div className={`backdrop-blur-lg border rounded-2xl p-8 mb-12 transition-all duration-300 ${
          isLight
            ? 'border-slate-200 bg-slate-50/40'
            : 'border-slate-700/50 bg-slate-900/40'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            isLight ? 'text-purple-600' : 'text-cyan-400'
          }`}>Create Ticket</h2>
          
          {error && (
            <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
              isLight
                ? 'bg-red-50 border-red-300'
                : 'bg-red-500/20 border-red-500/50'
            }`}>
              <p className={`text-sm transition-colors duration-300 ${
                isLight ? 'text-red-700' : 'text-red-300'
              }`}>{error}</p>
            </div>
          )}

          {success && (
            <div className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
              isLight
                ? 'bg-green-50 border-green-300'
                : 'bg-green-500/20 border-green-500/50'
            }`}>
              <p className={`text-sm transition-colors duration-300 ${
                isLight ? 'text-green-700' : 'text-green-300'
              }`}>{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your issue"
                className={`w-full px-4 py-3 rounded-lg border transition duration-300 focus:outline-none ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500'
                    : 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                }`}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Describe your issue"
                className={`w-full px-4 py-3 rounded-lg border transition duration-300 focus:outline-none resize-none ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500'
                    : 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                }`}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 transition duration-300"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        <div>
          <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            isLight ? 'text-purple-600' : 'text-cyan-400'
          }`}>FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`backdrop-blur-lg border rounded-xl p-6 transition-all duration-300 ${
                isLight
                  ? 'border-slate-200 bg-slate-50/40'
                  : 'border-slate-700/50 bg-slate-900/40'
              }`}>
                <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-purple-600' : 'text-cyan-400'
                }`}>{faq.q}</h3>
                <p className={`transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
