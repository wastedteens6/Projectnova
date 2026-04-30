import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * ProtectedRoute - Guard for authenticated user pages.
 * Redirects unauthenticated users to the login page.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
