import api from '../lib/api';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

interface User {
  id: string
  name: string
  email: string
  role: string
  mfa_enabled: boolean
  failed_login_attempts: number
  lockout_until: string | null
  created_at: string
}

const API = '${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api'

const isLockedFn = (u: User) =>
  !!(u.lockout_until && new Date(u.lockout_until) > new Date())

const initials = (name: string) => name.charAt(0).toUpperCase()

const avatarColor = (name: string) => {
  const colors = ['#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']
  return colors[name.charCodeAt(0) % colors.length]
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })

export default function AdminUsers() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dk = theme !== 'light'

  const [users, setUsers]               = useState<User[]>([])
  const [roles, setRoles]               = useState<{ name: string }[]>([])
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState<'all' | 'admin' | 'user'>('all')

  const token = localStorage.getItem('token')

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ru, rr] = await Promise.all([
        api.get(${API}/auth/users`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(${API}/roles`,      { headers: { Authorization: `Bearer ${token}` } })
          .catch(() => ({ data: { roles: [{ name: 'user' }, { name: 'admin' }] } }))
      ])
      setUsers(ru.data.data || [])
      setRoles(rr.data.roles || [{ name: 'user' }, { name: 'admin' }])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleRole = async (userId: string, newRole: string) => {
    if (!window.confirm(`Change role to '${newRole}'?`)) return
    setActionLoading(`role-${userId}`)
    try {
      await api.patch(${API}/auth/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } })
      showToast(`Role → ${newRole}`)
      setUsers(p => p.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (e: any) { showToast(e.response?.data?.error || 'Failed', false) }
    finally { setActionLoading(null) }
  }

  const handleResetMFA = async (userId: string, name: string) => {
    if (!window.confirm(`Reset MFA for ${name}?`)) return
    setActionLoading(`mfa-${userId}`)
    try {
      await api.patch(${API}/auth/users/${userId}/reset-mfa`, {}, { headers: { Authorization: `Bearer ${token}` } })
      showToast(`MFA reset for ${name}`)
      setUsers(p => p.map(u => u.id === userId ? { ...u, mfa_enabled: false } : u))
    } catch (e: any) { showToast(e.response?.data?.error || 'Failed', false) }
    finally { setActionLoading(null) }
  }

  const handleUnlock = async (userId: string, name: string) => {
    setActionLoading(`unlock-${userId}`)
    try {
      await api.patch(${API}/auth/users/${userId}/unlock`, {}, { headers: { Authorization: `Bearer ${token}` } })
      showToast(`Unlocked ${name}`)
      setUsers(p => p.map(u => u.id === userId ? { ...u, lockout_until: null, failed_login_attempts: 0 } : u))
    } catch (e: any) { showToast(e.response?.data?.error || 'Failed', false) }
    finally { setActionLoading(null) }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalUsers  = users.length
  const adminCount  = users.filter(u => u.role === 'admin').length
  const mfaCount    = users.filter(u => u.mfa_enabled).length
  const lockedCount = users.filter(isLockedFn).length

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const headBg   = dk ? 'bg-slate-900/50'                 : 'bg-slate-50/50'
  const rowHover = dk ? 'hover:bg-slate-800/40'           : 'hover:bg-slate-50'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const input    = dk
    ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-purple-500'
    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400'

  return (
    <div className={`min-h-screen pointer-events-none ${surface}`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl pointer-events-auto backdrop-blur-md
          ${toast.ok ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: title + stats */}
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">User Management</h1>
            <div className={`hidden md:flex items-center gap-4 text-xs font-medium ${muted}`}>
              <span><span className="font-bold text-inherit">{totalUsers}</span> total</span>
              <span className="w-px h-3 bg-current opacity-20" />
              <span><span className="font-bold text-purple-400">{adminCount}</span> admins</span>
              <span className="w-px h-3 bg-current opacity-20" />
              <span><span className="font-bold text-emerald-400">{mfaCount}</span> MFA</span>
              {lockedCount > 0 && <>
                <span className="w-px h-3 bg-current opacity-20" />
                <span><span className="font-bold text-red-400">{lockedCount}</span> locked</span>
              </>}
            </div>
          </div>
          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >← Back</button>
            <button
              onClick={fetchData}
              disabled={loading}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              } disabled:opacity-40`}
            >
              <span className={loading ? 'animate-spin inline-block' : ''}>↻</span> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className={`border-b ${border} pointer-events-auto transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 py-2.5 flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-56 px-3 py-1.5 text-xs rounded-md border outline-none transition ${input}`}
          />
          {/* Role pills */}
          <div className={`flex items-center gap-0.5 text-xs rounded-md border overflow-hidden ${border}`}>
            {(['all', 'user', 'admin'] as const).map(f => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-3 py-1.5 font-medium transition capitalize ${
                  roleFilter === f
                    ? dk ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                    : `${muted} hover:${dk ? 'bg-white/5' : 'bg-slate-50'}`
                }`}
              >{f === 'all' ? 'All' : f}</button>
            ))}
          </div>
          <span className={`text-xs ml-auto ${muted}`}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 pointer-events-auto">
        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
            <thead>
              <tr className={`border-b ${border} ${headBg}`}>
                {['#', 'User', 'Role', 'MFA', 'Status', 'Joined', 'Manage Role', 'MFA Action', 'Account Action'].map(h => (
                  <th key={h} className={`px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-[10px] ${muted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span className={`text-xs ${muted}`}>Loading…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`py-16 text-center text-xs ${muted}`}>
                    No users match your filter
                  </td>
                </tr>
              ) : filtered.map((user, idx) => {
                const locked = isLockedFn(user)
                return (
                  <tr key={user.id} className={`border-b ${border} ${rowHover} transition-colors`}>

                    {/* # */}
                    <td className={`px-4 py-3 font-mono text-[10px] w-10 ${muted}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: avatarColor(user.name) }}
                        >{initials(user.name)}</span>
                        <div>
                          <p className={`font-medium leading-tight ${dk ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                          <p className={`text-[10px] mt-0.5 ${muted}`}>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {user.role === 'admin'
                        ? <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-400">Admin</span>
                        : <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${dk ? 'bg-white/8 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>User</span>
                      }
                    </td>

                    {/* MFA */}
                    <td className="px-4 py-3">
                      {user.mfa_enabled
                        ? <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">ON</span>
                        : <span className={`text-[10px] ${muted}`}>—</span>
                      }
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {locked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400">Locked</span>
                      ) : user.failed_login_attempts > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">{user.failed_login_attempts} failed</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">Active</span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className={`px-4 py-3 text-[10px] ${muted}`}>{fmtDate(user.created_at)}</td>

                    {/* Manage Role */}
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={e => handleRole(user.id, e.target.value)}
                        disabled={actionLoading === `role-${user.id}`}
                        className={`px-2 py-1 rounded border text-[10px] font-medium outline-none transition cursor-pointer disabled:opacity-40 w-20 ${
                          dk
                            ? 'bg-slate-900/50 border-slate-700/50 text-slate-300 focus:border-purple-500'
                            : 'bg-white border-slate-200 text-slate-700 focus:border-purple-400'
                        }`}
                      >
                        {roles.map(r => (
                          <option key={r.name} value={r.name}>
                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* MFA Action */}
                    <td className="px-4 py-3">
                      {user.mfa_enabled ? (
                        <button
                          onClick={() => handleResetMFA(user.id, user.name)}
                          disabled={actionLoading === `mfa-${user.id}`}
                          title="Reset MFA"
                          className={`px-2 py-1 rounded border text-[10px] font-medium transition disabled:opacity-40 ${
                            dk
                              ? 'border-amber-700/50 text-amber-400 hover:bg-amber-500/10'
                              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          {actionLoading === `mfa-${user.id}` ? '…' : 'Reset MFA'}
                        </button>
                      ) : (
                        <span className={`text-[10px] ${muted}`}>—</span>
                      )}
                    </td>

                    {/* Account Action */}
                    <td className="px-4 py-3">
                      {locked ? (
                        <button
                          onClick={() => handleUnlock(user.id, user.name)}
                          disabled={actionLoading === `unlock-${user.id}`}
                          title="Unlock account"
                          className={`px-2 py-1 rounded border text-[10px] font-medium transition disabled:opacity-40 ${
                            dk
                              ? 'border-red-700/50 text-red-400 hover:bg-red-500/10'
                              : 'border-red-200 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          {actionLoading === `unlock-${user.id}` ? '…' : 'Unlock'}
                        </button>
                      ) : (
                        <span className={`text-[10px] ${muted}`}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && users.length > 0 && (
          <div className={`px-4 py-2.5 border-t ${border} flex items-center justify-between`}>
            <span className={`text-[10px] ${muted}`}>
              {filtered.length} of {users.length} users
            </span>
            <div className={`flex items-center gap-3 text-[10px] ${muted}`}>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" />Admin</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />MFA On</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Locked</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
