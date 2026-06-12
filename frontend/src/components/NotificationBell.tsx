import React, { useState, useEffect, useRef } from 'react'
import api from '../lib/api'
import { useTheme } from '../context/ThemeContext'
import { HiOutlineBell } from 'react-icons/hi2'
import { motion } from 'framer-motion'

export default function NotificationBell() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await api.get('/notifications')
      const data = response.data
      if (data.success) {
        setNotifications(data.data)
        setUnreadCount(data.data.filter((n: any) => !n.is_read).length)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // Poll every 1 minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const clearAllNotifications = async () => {
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return
    try {
      await api.delete('/notifications/clear-all')
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Error clearing notifications:', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all relative ${
          isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-800 text-slate-300'
        }`}
      >
        <HiOutlineBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          </span>
        )}
      </motion.button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl overflow-hidden z-[60] transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200' : 'bg-slate-900 border-slate-800 shadow-black'
        }`}>
          <div className={`p-4 border-b flex justify-between items-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Notifications</h3>
            <div className="flex gap-3">
              {notifications.length > 0 && (
                <button 
                  onClick={clearAllNotifications}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  Clear all
                </button>
              )}
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`p-8 text-center text-sm ${isLight ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`p-4 border-b last:border-0 cursor-pointer transition-colors ${
                    !n.is_read 
                      ? isLight ? 'bg-blue-50 hover:bg-blue-100' : 'bg-blue-900/10 hover:bg-blue-900/20'
                      : isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'
                  } ${isLight ? 'border-slate-100' : 'border-slate-800'}`}
                >
                  <p className={`font-bold text-sm mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{n.title}</p>
                  <p className={`text-xs mb-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {n.message}
                  </p>
                  <p className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(n.created_at).toLocaleString()}
                  </p>

                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
