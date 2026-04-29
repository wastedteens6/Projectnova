import React, { useState } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

export default function Register() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [nameFocus, setNameFocus] = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)

  // Password strength validation
  const checkPasswordStrength = (pwd) => {
    let strength = 0
    const feedback = []

    if (pwd.length >= 8) strength += 1
    else feedback.push('Min 8 characters')

    if (pwd.length >= 12) strength += 0.5
    else feedback.push('12+ chars for extra strength')

    if (/[A-Z]/.test(pwd)) strength += 1
    else feedback.push('Add uppercase letter')

    if (/[a-z]/.test(pwd)) strength += 1
    else feedback.push('Add lowercase letter')

    if (/[0-9]/.test(pwd)) strength += 1
    else feedback.push('Add number')

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1
    else feedback.push('Add special character (!@#$%^&*)')

    const requiredPoints = 4
    const isStrong = strength >= requiredPoints

    return {
      strength: Math.min(5, Math.round(strength)),
      isStrong,
      feedback,
      maxFeedback: Math.max(0, 3 - Math.round(strength))
    }
  }

  const passwordStrength = checkPasswordStrength(password)
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!passwordStrength.isStrong) {
      setError('Password is not strong enough. ' + passwordStrength.feedback.join(', '))
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      })

      setSuccess('Registration successful! Redirecting...')
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userRole', res.data.user.role)
      localStorage.setItem('userEmail', res.data.user.email)
      localStorage.setItem('userName', res.data.user.name)
      
      setTimeout(() => {
        window.location.href = res.data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center pt-20 pb-20 px-4 relative overflow-hidden transition-all duration-300 w-full pointer-events-none ${
      isLight ? 'text-slate-900 bg-transparent' : 'text-white bg-transparent'
    }`}>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 -left-32 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse transition-all duration-300 ${
          isLight ? 'bg-purple-400' : 'bg-purple-600'
        }`}></div>
        <div className={`absolute -bottom-32 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse transition-all duration-300 ${
          isLight ? 'bg-cyan-400' : 'bg-cyan-600'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse transition-all duration-300 ${
          isLight ? 'bg-blue-400' : 'bg-blue-600'
        }`} style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md pointer-events-auto">
        {/* Card Container */}
        <div className={`backdrop-blur-lg border rounded-2xl p-8 shadow-2xl hover:border-slate-600/50 transition-all duration-300 ${
          isLight
            ? 'border-slate-200 bg-slate-50/40'
            : 'border-slate-700/50 bg-slate-900/40'
        }`}>
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Join Us
              </span>
            </h1>
            <p className={`text-sm transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>Create an account to access premium projects</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg animate-pulse border transition-all duration-300 ${
              isLight
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-red-500/20 border-red-500/50'
            }`}>
              <p className={`text-sm flex items-center gap-2 transition-colors duration-300 ${
                isLight ? 'text-red-700' : 'text-red-300'
              }`}>
                <span>⚠️</span> {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className={`mb-6 p-4 rounded-lg animate-pulse border transition-all duration-300 ${
              isLight
                ? 'bg-green-50 border-green-300'
                : 'bg-green-500/20 border-green-500/50'
            }`}>
              <p className={`text-sm flex items-center gap-2 transition-colors duration-300 ${
                isLight ? 'text-green-700' : 'text-green-300'
              }`}>
                <span>✓</span> {success}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 group-focus-within:text-cyan-400 transition duration-300 ${
                isLight
                  ? 'text-slate-700 group-focus-within:text-purple-600'
                  : 'text-slate-300 group-focus-within:text-cyan-400'
              }`}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                placeholder="Your name"
                className={`w-full px-4 py-3 rounded-lg border transition duration-300 focus:outline-none ${
                  nameFocus
                    ? isLight
                      ? 'border-purple-500 bg-slate-100 shadow-lg shadow-purple-500/20'
                      : 'border-cyan-500 bg-slate-900/70 shadow-lg shadow-cyan-500/20'
                    : isLight
                      ? 'border-slate-300 bg-slate-100 hover:border-slate-400'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                } ${isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-slate-500'}`}
                required
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 group-focus-within:text-cyan-400 transition duration-300 ${
                isLight
                  ? 'text-slate-700 group-focus-within:text-purple-600'
                  : 'text-slate-300 group-focus-within:text-cyan-400'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border transition duration-300 focus:outline-none ${
                  emailFocus
                    ? isLight
                      ? 'border-purple-500 bg-slate-100 shadow-lg shadow-purple-500/20'
                      : 'border-cyan-500 bg-slate-900/70 shadow-lg shadow-cyan-500/20'
                    : isLight
                      ? 'border-slate-300 bg-slate-100 hover:border-slate-400'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                } ${isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-slate-500'}`}
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="group">
              <label className={`block text-sm font-bold mb-2 group-focus-within:text-cyan-400 transition duration-300 ${
                isLight
                  ? 'text-slate-700 group-focus-within:text-purple-600'
                  : 'text-slate-300 group-focus-within:text-cyan-400'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition duration-300 focus:outline-none ${
                    passwordFocus
                      ? isLight
                        ? 'border-purple-500 bg-slate-100 shadow-lg shadow-purple-500/20'
                        : 'border-cyan-500 bg-slate-900/70 shadow-lg shadow-cyan-500/20'
                      : isLight
                        ? 'border-slate-300 bg-slate-100 hover:border-slate-400'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  } ${isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-slate-500'}`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition duration-300 text-xl ${
                    isLight
                      ? 'text-slate-600 hover:text-purple-600'
                      : 'text-slate-400 hover:text-cyan-400'
                  }`}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  {/* Strength Bar */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                          i < passwordStrength.strength
                            ? strengthColors[passwordStrength.strength - 1]
                            : isLight
                              ? 'bg-slate-200'
                              : 'bg-slate-700'
                        }`}
                      ></div>
                    ))}
                  </div>

                  {/* Strength Label */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold transition-colors duration-300 ${
                      passwordStrength.strength === 5
                        ? 'text-green-500'
                        : passwordStrength.strength >= 3
                          ? 'text-lime-500'
                          : 'text-orange-500'
                    }`}>
                      {strengthLabels[passwordStrength.strength - 1] || 'Very Weak'} Password
                    </span>
                    <span className={`text-xs transition-colors duration-300 ${
                      passwordStrength.isStrong
                        ? 'text-green-500'
                        : isLight
                          ? 'text-slate-500'
                          : 'text-slate-400'
                    }`}>
                      {passwordStrength.isStrong ? '✓ Strong' : '✗ Weak'}
                    </span>
                  </div>

                  {/* Requirements Feedback */}
                  {passwordStrength.maxFeedback > 0 && (
                    <div className={`p-3 rounded-lg text-xs space-y-1 transition-all duration-300 ${
                      isLight
                        ? 'bg-slate-100 border border-slate-200'
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}>
                      {passwordStrength.feedback.slice(0, 2).map((item, idx) => (
                        <p key={idx} className={`transition-colors duration-300 ${
                          isLight ? 'text-slate-600' : 'text-slate-300'
                        }`}>
                          • {item}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name || !email || !passwordStrength.isStrong}
              className={`w-full py-3 rounded-lg font-bold transition transform duration-300 ${
                loading || !name || !email || !passwordStrength.isStrong
                  ? isLight
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className={`inline-block w-4 h-4 border-2 rounded-full animate-spin ${
                    isLight
                      ? 'border-slate-400 border-t-purple-600'
                      : 'border-slate-400 border-t-cyan-400'
                  }`}></span>
                  Creating account...
                </span>
              ) : !passwordStrength.isStrong && password ? (
                '⚠️ Password too weak'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={`my-6 flex items-center gap-4 transition-all duration-300`}>
            <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${
              isLight ? 'to-slate-300' : 'to-slate-700'
            }`}></div>
            <span className={`text-xs transition-colors duration-300 ${
              isLight ? 'text-slate-500' : 'text-slate-500'
            }`}>Or</span>
            <div className={`flex-1 h-px bg-gradient-to-l from-transparent ${
              isLight ? 'to-slate-300' : 'to-slate-700'
            }`}></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className={`text-sm transition-colors duration-300 ${
              isLight ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Already have an account?{' '}
              <a href="/auth/login" className={`font-bold transition duration-300 ${
                isLight
                  ? 'text-purple-600 hover:text-purple-700'
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}>
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce transition-all duration-300 ${
          isLight ? 'bg-purple-400' : 'bg-purple-600'
        }`}></div>
        <div className={`absolute -bottom-10 -left-10 w-20 h-20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce transition-all duration-300 ${
          isLight ? 'bg-cyan-400' : 'bg-cyan-600'
        }`} style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}
