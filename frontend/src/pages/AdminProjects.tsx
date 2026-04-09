import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

interface Project {
  id: number
  slug: string
  title: string
  category: string
  tiers: { price: number }[]
}

export default function AdminProjects() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [projects, setProjects] = useState<Project[]>([])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/projects/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setProjects(res.data.data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        alert('Project deleted successfully!')
        fetchProjects()
      } catch (err) {
        alert('Failed to delete project: ' + (err.response?.data?.error || err.message))
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-900 text-white shadow-lg">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Manage Projects</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Projects</h2>
          <button
            onClick={() => navigate('/admin/projects/create')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            + Add New Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Title</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Category</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Tier 1 Price</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map(project => (
                  <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6 text-slate-900">{project.title}</td>
                    <td className="py-4 px-6 text-slate-600">{project.category}</td>
                    <td className="py-4 px-6 text-slate-600">₹{project.tiers?.[0]?.price || 'N/A'}</td>
                    <td className="py-4 px-6 flex gap-2">
                      <button
                        onClick={() => navigate(`/projects/${project.slug}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 px-6 text-center text-slate-500">
                    No projects yet. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
