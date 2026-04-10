import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

export default function AdminCreateProject() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Web',
    description: '',
    techStack: '',
    keyFeatures: '',
    tier1GoogleDrive: '',
    tier1Features: '',
    tier1Price: '',
    tier2GoogleDrive: '',
    tier2Features: '',
    tier2Price: '',
    tier3GoogleDrive: '',
    tier3Features: '',
    tier3Price: '',
    isPublished: true
  })

  const [projectImages, setProjectImages] = useState<File[]>([])
  const [previewVideo, setPreviewVideo] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditMode)
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })

  const categories = ['Web', 'AI', 'ML', 'IoT', 'DBMS', 'Mobile', 'Blockchain', 'Cybersecurity', 'Data', 'other']

  // Load project data for editing
  useEffect(() => {
    if (isEditMode && id) {
      const fetchProject = async () => {
        try {
          const token = localStorage.getItem('token')
          const res = await axios.get(`http://localhost:5000/api/admin/projects/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          // Find the project by id
          const project = res.data.data.find((p: any) => p.id === id)
          if (!project) {
            showAlert('Project not found', 'error')
            navigate('/admin/projects')
            return
          }

          // Populate form with existing data
          setFormData({
            title: project.title || '',
            slug: project.slug || '',
            category: project.category || 'Web',
            description: project.description || '',
            techStack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : project.tech_stack || '',
            keyFeatures: Array.isArray(project.features) ? project.features.join(', ') : project.features || '',
            tier1GoogleDrive: project.tiers?.[0]?.drive_link || '',
            tier1Features: Array.isArray(project.tiers?.[0]?.features) ? project.tiers[0].features.join(', ') : '',
            tier1Price: project.tiers?.[0]?.price?.toString() || '',
            tier2GoogleDrive: project.tiers?.[1]?.drive_link || '',
            tier2Features: Array.isArray(project.tiers?.[1]?.features) ? project.tiers[1].features.join(', ') : '',
            tier2Price: project.tiers?.[1]?.price?.toString() || '',
            tier3GoogleDrive: project.tiers?.[2]?.drive_link || '',
            tier3Features: Array.isArray(project.tiers?.[2]?.features) ? project.tiers[2].features.join(', ') : '',
            tier3Price: project.tiers?.[2]?.price?.toString() || '',
            isPublished: project.is_published !== false
          })

          // Load existing images
          if (project.media?.images && project.media.images.length > 0) {
            setImagePreview(project.media.images.map((img: string) => {
              if (!img.startsWith('http')) {
                return `http://localhost:5000${img.startsWith('/') ? img : '/' + img}`
              }
              return img
            }))
          }

          // Load existing video
          if (project.media?.videos && project.media.videos.length > 0) {
            const videoUrl = project.media.videos[0]
            if (!videoUrl.startsWith('http')) {
              setVideoPreview(`http://localhost:5000${videoUrl.startsWith('/') ? videoUrl : '/' + videoUrl}`)
            } else {
              setVideoPreview(videoUrl)
            }
          }

          setPageLoading(false)
        } catch (error) {
          console.error('Error loading project:', error)
          showAlert('Error loading project', 'error')
          navigate('/admin/projects')
        }
      }

      fetchProject()
    }
  }, [id, isEditMode, navigate])

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    
    let newValue = type === 'checkbox' ? checked : value
    
    // Auto-generate slug when title changes
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        slug: generateSlug(newValue as string)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }))
    }
  }

  const handleImageUpload = (e: any) => {
    const files = Array.from(e.target.files || []) as File[]
    
    if (files.length + projectImages.length > 10) {
      showAlert('Maximum 10 images allowed', 'error')
      return
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showAlert(`${file.name} exceeds 5MB limit`, 'error')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    setProjectImages(prev => [...prev, ...files])
  }

  const handleVideoUpload = (e: any) => {
    const file = e.target.files?.[0]
    
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      showAlert('Video exceeds 50MB limit', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setVideoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setPreviewVideo(file)
  }

  const removeImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => {
    setPreviewVideo(null)
    setVideoPreview(null)
  }

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    
    if (!formData.title || !formData.category || !formData.description) {
      showAlert('Title, category, and description are required', 'error')
      return
    }

    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        showAlert('You must be logged in as an admin', 'error')
        setLoading(false)
        return
      }

      const data = new FormData()
      
      // Add form data
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key as keyof typeof formData])
      })

      // Add images
      projectImages.forEach(img => {
        data.append('projectImages', img)
      })

      // Add video
      if (previewVideo) {
        data.append('previewVideo', previewVideo)
      }

      // Add tier prices
      data.append('tier1Price', formData.tier1Price)
      data.append('tier2Price', formData.tier2Price)
      data.append('tier3Price', formData.tier3Price)

      const url = isEditMode 
        ? `http://localhost:5000/api/admin/projects/${id}`
        : 'http://localhost:5000/api/admin/projects/create'
      
      const method = isEditMode ? 'put' : 'post'

      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - axios will set it with boundary automatically
        }
      })

      showAlert(isEditMode ? 'Project updated successfully!' : 'Project created successfully!', 'success')
      
      // Redirect after success
      setTimeout(() => {
        navigate('/admin/projects')
      }, 1500)
    } catch (error: any) {
      showAlert(error.response?.data?.error || `Error ${isEditMode ? 'updating' : 'creating'} project`, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 transition-all duration-300 ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 transition-all duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-4xl mx-auto">
        {/* Alert */}
        {alert.show && (
          <div className={`fixed top-24 right-4 px-6 py-3 rounded-lg z-50 animate-pulse border transition-all duration-300 ${
            alert.type === 'success'
              ? isLight
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-green-500/20 border-green-500/50 text-green-300'
              : isLight
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-red-500/20 border-red-500/50 text-red-300'
          }`}>
            {alert.message}
          </div>
        )}

        <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>{isEditMode ? 'Edit Project' : 'Create New Project'}</h1>
        <p className={`mb-8 transition-colors duration-300 ${
          isLight ? 'text-slate-600' : 'text-slate-300'
        }`}>{isEditMode ? 'Update project information' : 'Add a new project to the platform'}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className={`p-6 rounded-lg border transition-all duration-300 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., E-Commerce MERN Stack"
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white focus:border-purple-600'
                      : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Slug (Auto-generated)</label>
                <input
                  type="text"
                  value={formData.slug}
                  placeholder="auto-generated from title"
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none opacity-70 cursor-not-allowed ${
                    isLight
                      ? 'border-slate-300 bg-slate-100'
                      : 'border-slate-600 bg-slate-700'
                  }`}
                  disabled
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white focus:border-purple-600'
                      : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                  }`}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div />
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed overview of your project..."
                rows={5}
                className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                  isLight
                    ? 'border-slate-300 bg-white focus:border-purple-600'
                    : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                }`}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleInputChange}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white focus:border-purple-600'
                      : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Key Features (comma-separated)</label>
                <input
                  type="text"
                  name="keyFeatures"
                  value={formData.keyFeatures}
                  onChange={handleInputChange}
                  placeholder="e.g., Authentication, Payment Gateway"
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white focus:border-purple-600'
                      : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Tier System */}
          {[
            { tier: 1, label: 'Tier 1: Code Only' },
            { tier: 2, label: 'Tier 2: Code + Videos' },
            { tier: 3, label: 'Tier 3: Premium Support' }
          ].map(({ tier, label }) => (
            <div key={tier} className={`p-6 rounded-lg border transition-all duration-300 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
            }`}>
              <h2 className="text-2xl font-bold mb-6">{label}</h2>

              <div className="mb-6">
                <label className="block font-semibold mb-2">Price (₹) *</label>
                <input
                  type="number"
                  name={`tier${tier}Price`}
                  value={formData[`tier${tier}Price` as keyof typeof formData]}
                  onChange={handleInputChange}
                  placeholder="e.g., 499"
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white focus:border-purple-600'
                      : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-2">Google Drive Link *</label>
                <input
                  type="url"
                  name={`tier${tier}GoogleDrive`}
                  value={formData[`tier${tier}GoogleDrive` as keyof typeof formData]}
                  onChange={handleInputChange}
                  placeholder="https://drive.google.com/..."
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white focus:border-purple-600'
                      : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Tier Features (comma-separated) *</label>
                <input
                  type="text"
                  name={`tier${tier}Features`}
                  value={formData[`tier${tier}Features` as keyof typeof formData]}
                  onChange={handleInputChange}
                  placeholder="e.g., Source Code, Documentation"
                  className={`w-full px-4 py-2 rounded-lg border transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-slate-300 bg-white focus:border-purple-600'
                      : 'border-slate-600 bg-slate-800 focus:border-cyan-500'
                  }`}
                  required
                />
              </div>
            </div>
          ))}

          {/* Project Media */}
          <div className={`p-6 rounded-lg border transition-all duration-300 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <h2 className="text-2xl font-bold mb-6">Project Media</h2>

            <div className="mb-8">
              <label className="block font-semibold mb-4">Project Images (up to 10, max 5MB each)</label>
              <div className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition duration-300 ${
                isLight
                  ? 'border-slate-300 hover:border-purple-600 bg-slate-100'
                  : 'border-slate-600 hover:border-cyan-500 bg-slate-800'
              }`}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  <p className="text-lg font-semibold">Click to upload images</p>
                  <p className="text-sm opacity-75">or drag and drop</p>
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-4">Preview Video (max 50MB)</label>
              <div className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition duration-300 ${
                isLight
                  ? 'border-slate-300 hover:border-purple-600 bg-slate-100'
                  : 'border-slate-600 hover:border-cyan-500 bg-slate-800'
              }`}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="videoInput"
                />
                <label htmlFor="videoInput" className="cursor-pointer">
                  <p className="text-lg font-semibold">Click to upload video</p>
                  <p className="text-sm opacity-75">Supported formats: mp4, avi, mov, mkv</p>
                </label>
              </div>

              {/* Video Preview */}
              {videoPreview && (
                <div className="mt-6 relative">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-w-md rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div className={`p-6 rounded-lg border transition-all duration-300 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <h2 className="text-2xl font-bold mb-6">Visibility</h2>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="publish"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="publish" className="ml-3 cursor-pointer font-semibold">
                Publish immediately (make project live on the site)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className={`px-8 py-3 rounded-lg font-bold transition duration-300 ${
                isLight
                  ? 'bg-slate-300 hover:bg-slate-400 text-slate-900'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
