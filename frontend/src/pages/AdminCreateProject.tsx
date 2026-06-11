import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

export default function AdminCreateProject() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const dk = !isLight
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
          const res = await axios.get(`${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/admin/projects/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          const project = res.data.data.find((p: any) => p.id === id)
          if (!project) {
            showAlert('Project not found', 'error')
            navigate('/admin/projects')
            return
          }

          setFormData({
            title: project.title || '',
            slug: project.slug || '',
            category: project.category || 'Web',
            description: project.description || '',
            techStack: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
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

          if (project.images && project.images.length > 0) {
            setImagePreview(project.images.map((img: string) => 
              img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL||'http://localhost:5000'}${img}`
            ))
          }

          if (project.videos && project.videos.length > 0) {
            const videoUrl = project.videos[0]
            setVideoPreview(videoUrl.startsWith('http') ? videoUrl : `${import.meta.env.VITE_API_URL||'http://localhost:5000'}${videoUrl}`)
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

  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    let newValue = type === 'checkbox' ? checked : value
    if (name === 'title') {
      setFormData(prev => ({ ...prev, [name]: newValue, slug: generateSlug(newValue as string) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: newValue }))
    }
  }

  const handleImageUpload = (e: any) => {
    const files = Array.from(e.target.files || []) as File[]
    if (files.length + projectImages.length > 10) { showAlert('Maximum 10 images allowed', 'error'); return }
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { showAlert(`${file.name} exceeds 5MB limit`, 'error'); return }
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
    setProjectImages(prev => [...prev, ...files])
  }

  const handleVideoUpload = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { showAlert('Video exceeds 50MB limit', 'error'); return }
    const reader = new FileReader()
    reader.onload = (e) => setVideoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setPreviewVideo(file)
  }

  const removeImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => { setPreviewVideo(null); setVideoPreview(null) }

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!formData.title || !formData.category || !formData.description) { showAlert('Title, category, and description are required', 'error'); return }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) { showAlert('You must be logged in as an admin', 'error'); setLoading(false); return }
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key as keyof typeof formData] as any))
      projectImages.forEach(img => data.append('projectImages', img))
      if (previewVideo) data.append('previewVideo', previewVideo)

      const url = isEditMode ? `${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/admin/projects/${id}` : '${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api/admin/projects/create'
      const method = isEditMode ? 'put' : 'post'

      await axios({ method, url, data, headers: { 'Authorization': `Bearer ${token}` } })
      showAlert(isEditMode ? 'Project updated successfully!' : 'Project created successfully!', 'success')
      setTimeout(() => navigate('/admin/projects'), 1500)
    } catch (error: any) {
      showAlert(error.response?.data?.error || 'Error saving project', 'error')
    } finally { setLoading(false) }
  }

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'
  const inputBg  = dk ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-400'

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pb-12 ${surface}`}>
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-20 right-6 px-4 py-2 text-xs font-bold rounded-lg z-50 animate-fade-in border shadow-lg ${
          alert.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
        }`}>
          {alert.message}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">{isEditMode ? 'Edit Project' : 'New Project'}</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>Configure details and tiers</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50"
            >{loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}</button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 grid lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Basic Info & Media */}
        <div className="lg:col-span-2 space-y-6">
          <section className={`p-5 rounded-xl border ${cardBg}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded bg-purple-500/10 text-purple-500 text-[10px]">📄</span>
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Project Title *</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition ${inputBg}`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Category *</label>
                <select
                  name="category" value={formData.category} onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition ${inputBg}`}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Description *</label>
              <textarea
                name="description" value={formData.description} onChange={handleInputChange} rows={4}
                className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition ${inputBg}`}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Technologies (comma-sep)</label>
                <input
                  type="text" name="techStack" value={formData.techStack} onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition ${inputBg}`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Key Features (comma-sep)</label>
                <input
                  type="text" name="keyFeatures" value={formData.keyFeatures} onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition ${inputBg}`}
                />
              </div>
            </div>
          </section>

          <section className={`p-5 rounded-xl border ${cardBg}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded bg-blue-500/10 text-blue-500 text-[10px]">🎞️</span>
              Project Media
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Images (Up to 10)</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition ${dk ? 'border-slate-800' : 'border-slate-200'}`}>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="imgUp" />
                  <label htmlFor="imgUp" className="cursor-pointer text-xs font-bold">Click to add images</label>
                </div>
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                    {imagePreview.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-md overflow-hidden border border-slate-800">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Preview Video</label>
                {!videoPreview ? (
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition ${dk ? 'border-slate-800' : 'border-slate-200'}`}>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="vidUp" />
                    <label htmlFor="vidUp" className="cursor-pointer text-xs font-bold">Click to add video</label>
                  </div>
                ) : (
                  <div className="relative group w-full max-w-sm rounded-lg overflow-hidden border border-slate-800">
                    <video src={videoPreview} controls className="w-full h-auto" />
                    <button onClick={removeVideo} className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-lg">Remove Video</button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Tiers & Visibility */}
        <div className="space-y-6">
          <section className={`p-5 rounded-xl border ${cardBg}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded bg-amber-500/10 text-amber-500 text-[10px]">💎</span>
              Pricing Tiers
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map(t => (
                <div key={t} className={`p-4 rounded-lg border ${dk ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-bold mb-3 uppercase tracking-wider text-purple-500">Tier {t}</h4>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${muted}`}>Price (₹)</label>
                      <input
                        type="number" name={`tier${t}Price`} value={formData[`tier${t}Price` as keyof typeof formData] as any} onChange={handleInputChange}
                        className={`w-full px-3 py-1.5 text-xs rounded border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${muted}`}>Drive Link</label>
                      <input
                        type="url" name={`tier${t}GoogleDrive`} value={formData[`tier${t}GoogleDrive` as keyof typeof formData] as any} onChange={handleInputChange}
                        className={`w-full px-3 py-1.5 text-xs rounded border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${muted}`}>Features (comma-sep)</label>
                      <textarea
                        name={`tier${t}Features`} value={formData[`tier${t}Features` as keyof typeof formData] as any} onChange={handleInputChange} rows={2}
                        className={`w-full px-3 py-1.5 text-xs rounded border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`p-5 rounded-xl border ${cardBg}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded bg-green-500/10 text-green-500 text-[10px]">👁️</span>
              Settings
            </h3>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800/50 bg-slate-800/20">
              <label className="text-xs font-bold">Published</label>
              <div 
                className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${formData.isPublished ? 'bg-purple-600' : 'bg-slate-600'}`}
                onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
              >
                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${formData.isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
