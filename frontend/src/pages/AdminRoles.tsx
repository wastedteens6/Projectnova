import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

interface Role {
  name: string
  permissions: string[]
  created_at?: string
}

const API = 'http://localhost:5000/api'

const AVAILABLE_PERMISSIONS = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/projects', label: 'Manage Projects' },
  { path: '/admin/projects/create', label: 'Create Project' },
  { path: '/admin/custom-projects', label: 'Custom Requests' },
  { path: '/admin/users', label: 'Manage Users' },
  { path: '/admin/roles', label: 'Manage Roles' },
  { path: '/admin/orders', label: 'Orders' },
  { path: '/admin/purchases', label: 'Purchases' },
  { path: '/admin/support', label: 'Support' },
  { path: '/admin/analytics', label: 'Analytics' },
]

export default function AdminRoles() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dk = theme !== 'light'
  
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  
  const [formName, setFormName] = useState('')
  const [formPermissions, setFormPermissions] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const token = localStorage.getItem('token')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API}/roles`, { headers: { Authorization: `Bearer ${token}` } })
      setRoles(res.data.roles || [])
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to load roles', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoles() }, [])

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormName(role.name)
      setFormPermissions(role.permissions || [])
    } else {
      setEditingRole(null)
      setFormName('')
      setFormPermissions([])
    }
    setIsModalOpen(true)
  }

  const handleTogglePermission = (path: string) => {
    setFormPermissions(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path])
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return showToast('Role name is required', 'error')

    setActionLoading(true)
    try {
      if (editingRole) {
        await axios.put(`${API}/roles/${editingRole.name}`, { permissions: formPermissions }, { headers: { Authorization: `Bearer ${token}` } })
        showToast('Role updated successfully')
      } else {
        await axios.post(`${API}/roles`, { name: formName, permissions: formPermissions }, { headers: { Authorization: `Bearer ${token}` } })
        showToast('Role created successfully')
      }
      fetchRoles()
      setIsModalOpen(false)
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save role', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteRole = async (name: string) => {
    if (name === 'admin' || name === 'user') return showToast('Cannot delete default roles', 'error')
    if (!window.confirm(`Are you sure you want to delete the role '${name}'?`)) return
    
    try {
      await axios.delete(`${API}/roles/${name}`, { headers: { Authorization: `Bearer ${token}` } })
      showToast('Role deleted successfully')
      fetchRoles()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete role', 'error')
    }
  }

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const headBg   = dk ? 'bg-slate-900/50'                 : 'bg-slate-50/50'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'
  const inputBg  = dk ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-400'

  return (
    <div className={`min-h-screen pointer-events-none ${surface}`}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl pointer-events-auto backdrop-blur-md
          ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">Manage Roles & Access</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>Configure role permissions</span>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-3 py-1.5 rounded-md text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-1.5"
          >
            + Create Role
          </button>
        </div>
      </header>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 pointer-events-auto">
        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className={`border-b ${border} ${headBg}`}>
                <tr>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Role Name</th>
                  <th className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Page Access</th>
                  <th className={`px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Edit</th>
                  <th className={`px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-[10px] ${muted}`}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className={`py-16 text-center text-xs ${muted}`}>Loading roles…</td></tr>
                ) : roles.map((role) => (
                  <tr key={role.name} className={`border-b ${border} ${dk ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-4 py-3 w-40">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        role.name === 'admin' ? 'bg-purple-500/15 text-purple-500' : 
                        role.name === 'user' ? 'bg-blue-500/15 text-blue-500' : 
                        dk ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {role.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map(p => {
                            const routeName = AVAILABLE_PERMISSIONS.find(ap => ap.path === p)?.label || p;
                            return (
                              <span key={p} className={`px-1.5 py-0.5 rounded border text-[9px] font-medium ${
                                dk ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}>
                                {routeName}
                              </span>
                            )
                          })
                        ) : (
                          <span className={`text-[10px] italic ${muted}`}>No access</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenModal(role)}
                        className={`px-2 py-1 rounded border text-[10px] font-medium transition ${
                          dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >Edit</button>
                    </td>
                    <td className="px-4 py-3 text-right w-20">
                      {role.name !== 'admin' && role.name !== 'user' ? (
                        <button
                          onClick={() => handleDeleteRole(role.name)}
                          className={`px-2 py-1 rounded border text-[10px] font-medium transition ${
                            dk ? 'border-red-900/30 text-red-400 hover:bg-red-900/50' : 'border-red-200 text-red-700 hover:bg-red-50'
                          }`}
                        >Delete</button>
                      ) : (
                        <span className={`text-[10px] ${muted}`}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${dk ? 'bg-[#0f1117] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`px-5 py-3 border-b flex justify-between items-center ${dk ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
              <h2 className="text-sm font-bold">{editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}</h2>
              <button onClick={() => setIsModalOpen(false)} className={`text-lg leading-none ${muted} hover:text-red-500`}>&times;</button>
            </div>
            
            <form onSubmit={handleSaveRole}>
              <div className="p-5 space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Role Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={!!editingRole}
                    className={`w-full px-3 py-2 text-xs rounded-md border outline-none transition disabled:opacity-50 ${inputBg}`}
                    placeholder="e.g. manager"
                    required
                  />
                  {editingRole && <p className={`text-[10px] mt-1 ${muted}`}>Role names cannot be changed.</p>}
                </div>
                
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Permissions</label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {AVAILABLE_PERMISSIONS.map(perm => {
                      const checked = formPermissions.includes(perm.path)
                      return (
                        <label key={perm.path} className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-all ${
                          checked 
                            ? dk ? 'bg-purple-500/10 border-purple-500/50' : 'bg-purple-50 border-purple-300'
                            : dk ? 'bg-slate-800/30 border-slate-700/50 hover:border-purple-500/30' : 'bg-white border-slate-200 hover:border-purple-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermission(perm.path)}
                            className="mt-0.5 w-3 h-3 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold truncate leading-tight">{perm.label}</p>
                            <p className={`text-[9px] truncate ${muted}`}>{perm.path}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className={`px-5 py-3 border-t flex justify-end gap-2 ${dk ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >Cancel</button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-md text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
