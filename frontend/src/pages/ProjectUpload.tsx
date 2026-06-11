import api from '../lib/api';
import React, { useState } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

export default function ProjectUpload() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'AI',
    price: '',
    tags: '',
    file: null,
    thumbnail: null
  })

  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData(prev => ({ ...prev, [name]: files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const token = localStorage.getItem('token')
      
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price),
        techStack: formData.tags.split(',').map(t => t.trim())
      }

      await api.post(/api/projects/create', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        category: 'AI',
        price: '',
        tags: '',
        file: null,
        thumbnail: null
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 transition-all duration-300 pointer-events-none ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-2xl mx-auto pointer-events-auto">
        <div className="mb-8">
          <h1 className={`text-5xl font-bold mb-2 transition-colors duration-300 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Upload Project</h1>
          <p className={`transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>Share your project with thousands of students</p>
        </div>

        <div className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
          isLight
            ? 'border-slate-300'
            : 'border-slate-700'
        }`}>
          {/* Gradient border effect */}
          <div className={`absolute inset-0 transition-all duration-300 ${
            isLight
              ? 'bg-gradient-to-r from-purple-300/20 to-cyan-300/20'
              : 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20'
          }`}></div>

          <form onSubmit={handleSubmit} className={`relative z-10 p-8 space-y-6 transition-all duration-300 ${
            isLight ? 'bg-white' : 'bg-slate-950'
          }`}>
            {success && (
              <div className={`p-4 rounded-lg border transition-all duration-300 ${
                isLight
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-green-500/20 border-green-500/50 text-green-300'
              }`}>
                ✓ Project uploaded successfully!
              </div>
            )}

            {/* Title */}
            <div>
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-200'
              }`}>Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., AI ChatBot with NLP"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition duration-300 ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500'
                    : 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                }`}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-200'
              }`}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project features, technologies used, etc."
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition duration-300 ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500'
                    : 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                }`}
                required
              />
            </div>

            {/* Category & Price */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition duration-300 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-purple-500'
                      : 'bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500'
                  }`}
                >
                  <option>AI</option>
                  <option>ML</option>
                  <option>Web Development</option>
                  <option>Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="₹499"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition duration-300 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500'
                      : 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-slate-200'
              }`}>Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Python, NLP, TensorFlow"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition duration-300 ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-purple-500'
                    : 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                }`}
                required
              />
            </div>

            {/* File Uploads */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>Upload Thumbnail</label>
                <input
                  type="file"
                  name="thumbnail"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition duration-300 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-600 focus:border-purple-500'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 focus:border-cyan-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>Upload Project (ZIP)</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  accept=".zip,.pdf"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none transition duration-300 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-600 focus:border-purple-500'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 focus:border-cyan-500'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 font-bold text-white text-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 transition transform hover:scale-105"
            >
              {uploading ? 'Uploading...' : 'Upload Project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
