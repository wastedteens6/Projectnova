import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    window.location.href = '/auth/login'
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        console.log('Fetched users:', res.data)
        setUsers(res.data.data || [])
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-900 text-white shadow-lg">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Users Management</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">ID</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Name</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Email</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Role</th>
                <th className="text-left py-4 px-6 text-slate-900 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 px-6 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 px-6 text-center text-slate-500">
                    No users yet. Data will appear here when users are added.
                  </td>
                </tr>
              ) : (
                users.map((user: any, idx: number) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="py-4 px-6 text-slate-900 font-mono text-sm">{idx + 1}</td>
                    <td className="py-4 px-6 text-slate-900 font-medium">{user.name}</td>
                    <td className="py-4 px-6 text-slate-900">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'admin' ? '👑 Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
