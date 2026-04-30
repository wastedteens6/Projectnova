import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import AdminSidebar from './AdminSidebar'

/**
 * AdminRoute — Centralized admin access guard.
 * Wraps all /admin/* routes. Redirects any non-admin user
 * (or unauthenticated user) to /auth/login immediately.
 */
const AdminRoute = () => {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/auth/login" replace />
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const permissions = payload.permissions || []
    
    // Check if the current path is allowed
    // Allow exact matches, or sub-routes (e.g., /admin/projects covers /admin/projects/edit/123)
    const isAllowed = permissions.some((p: string) => 
      location.pathname === p || location.pathname.startsWith(p + '/')
    )
    
    if (payload.role !== 'admin' && !isAllowed) {
      // If they are not a super admin and don't have permission for this route
      return <Navigate to="/dashboard" replace />
    }
  } catch (err) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto custom-scrollbar">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminRoute
