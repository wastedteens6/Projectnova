import React, { useState } from 'react'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'

type LoginStep = 'credentials' | 'mfa' | 'forced_setup'

export default function Login() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Credentials step
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)

  // MFA step
  const [step, setStep] = useState<LoginStep>('credentials')
  const [mfaToken, setMfaToken] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaFocus, setMfaFocus] = useState(false)

  // Forced MFA setup state (when mfa_enabled = false in DB)
  const [setupToken, setSetupToken] = useState('')
  const [setupQr, setSetupQr] = useState('')
  const [setupSecret, setSetupSecret] = useState('')
  const [setupCode, setSetupCode] = useState('')
  const [setupFocus, setSetupFocus] = useState(false)

  // Shared state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const redirectAfterLogin = (role: string) => {
    window.location.href = role === 'admin' ? '/admin/dashboard' : '/dashboard'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', { email, password })

      if (res.data.mfa_setup_required) {
        // FORCED setup — user must enroll before getting access
        setSetupToken(res.data.setup_token)
        setSetupQr(res.data.qrDataUrl)
        setSetupSecret(res.data.secret)
        setStep('forced_setup')
        setLoading(false)
        return
      }

      if (res.data.mfa_required) {
        // MFA required — move to second step
        setMfaToken(res.data.mfa_token)
        setStep('mfa')
        setLoading(false)
        return
      }

      // No MFA — login complete
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userRole', res.data.user.role)
      localStorage.setItem('userEmail', res.data.user.email)
      localStorage.setItem('userName', res.data.user.name)
      setSuccess('Login successful! Redirecting...')
      redirectAfterLogin(res.data.user.role)
    } catch (err: any) {
      const data = err.response?.data
      if (data?.locked) {
        const until = data.lockedUntil ? new Date(data.lockedUntil).toLocaleTimeString() : ''
        setError(`🔒 Account locked until ${until}. Too many failed attempts.`)
      } else {
        setError(data?.error || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForcedSetupVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/mfa/verify-setup', {
        setup_token: setupToken,
        code: setupCode.trim(),
      })
      // Backend issues a full JWT immediately on forced setup completion
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userRole', res.data.user.role)
      localStorage.setItem('userEmail', res.data.user.email)
      localStorage.setItem('userName', res.data.user.name)
      setSuccess('🎉 MFA enabled! Redirecting to your dashboard...')
      redirectAfterLogin(res.data.user.role)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login/verify-mfa', {
        mfa_token: mfaToken,
        code: mfaCode.trim(),
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userRole', res.data.user.role)
      localStorage.setItem('userEmail', res.data.user.email)
      localStorage.setItem('userName', res.data.user.name)
      setSuccess('Login successful! Redirecting...')
      redirectAfterLogin(res.data.user.role)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (focused: boolean) =>
    `w-full px-4 py-3 rounded-lg border transition duration-300 focus:outline-none ${
      focused
        ? isLight
          ? 'border-purple-500 bg-slate-100 shadow-lg shadow-purple-500/20'
          : 'border-cyan-500 bg-slate-900/70 shadow-lg shadow-cyan-500/20'
        : isLight
          ? 'border-slate-300 bg-slate-100 hover:border-slate-400'
          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
    } ${isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-slate-500'}`

  return (
    <div className={`min-h-screen flex items-center justify-center pt-20 pb-20 px-4 relative overflow-hidden transition-all duration-300 w-full pointer-events-none ${
      isLight ? 'text-slate-900 bg-transparent' : 'text-white bg-transparent'
    }`}>

      <div className="relative z-10 w-full max-w-md pointer-events-auto">
        <div className={`backdrop-blur-lg border rounded-2xl p-8 shadow-2xl hover:border-slate-600/50 transition-all duration-300 ${
          isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-700/50 bg-slate-900/40'
        }`}>

          {/* ── Header ── */}
          <div className="mb-8 text-center">
            {step === 'credentials' ? (
              <>
                <h1 className="text-4xl font-black mb-2">
                  <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Welcome Back
                  </span>
                </h1>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Sign in to access your dashboard
                </p>
              </>
            ) : step === 'mfa' ? (
              <>
                <div className="text-5xl mb-3">🔐</div>
                <h1 className="text-3xl font-black mb-2">
                  <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Two-Factor Auth
                  </span>
                </h1>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Enter the 6-digit code from your authenticator app
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">🔒</div>
                <h1 className="text-3xl font-black mb-2">
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    Setup Required
                  </span>
                </h1>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Secure your account with an authenticator app to continue
                </p>
              </>
            )}

          </div>

          {/* ── Error/Success banners ── */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border ${
              isLight ? 'bg-red-50 border-red-300' : 'bg-red-500/20 border-red-500/50'
            }`}>
              <p className={`text-sm flex items-center gap-2 ${isLight ? 'text-red-700' : 'text-red-300'}`}>
                <span>⚠️</span> {error}
              </p>
            </div>
          )}
          {success && (
            <div className={`mb-6 p-4 rounded-lg border ${
              isLight ? 'bg-green-50 border-green-300' : 'bg-green-500/20 border-green-500/50'
            }`}>
              <p className={`text-sm flex items-center gap-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                <span>✓</span> {success}
              </p>
            </div>
          )}

          {/* ── Step 1: Credentials ── */}
          {step === 'credentials' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className={`block text-sm font-bold mb-2 group-focus-within:text-cyan-400 transition duration-300 ${
                  isLight ? 'text-slate-700 group-focus-within:text-purple-600' : 'text-slate-300 group-focus-within:text-cyan-400'
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
                  className={inputClass(emailFocus)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="group">
                <label className={`block text-sm font-bold mb-2 group-focus-within:text-cyan-400 transition duration-300 ${
                  isLight ? 'text-slate-700 group-focus-within:text-purple-600' : 'text-slate-300 group-focus-within:text-cyan-400'
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
                    className={`${inputClass(passwordFocus)} pr-12`}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition duration-300 text-xl ${
                      isLight ? 'text-slate-600 hover:text-purple-600' : 'text-slate-400 hover:text-cyan-400'
                    }`}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <a href="/auth/forgot-password" className={`text-sm transition duration-300 inline-block ${
                isLight ? 'text-purple-600 hover:text-purple-700' : 'text-cyan-400 hover:text-cyan-300'
              }`}>
                Forgot password?
              </a>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold transition transform duration-300 ${
                  loading
                    ? isLight ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className={`inline-block w-4 h-4 border-2 rounded-full animate-spin ${
                      isLight ? 'border-slate-400 border-t-purple-600' : 'border-slate-400 border-t-cyan-400'
                    }`} />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Step 2: MFA Code ── */}
          {step === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div className="group">
                <label className={`block text-sm font-bold mb-2 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  Authenticator Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setMfaFocus(true)}
                  onBlur={() => setMfaFocus(false)}
                  placeholder="000000"
                  className={`${inputClass(mfaFocus)} text-center text-2xl tracking-[0.5em] font-mono`}
                  maxLength={6}
                  required
                  autoFocus
                  disabled={loading}
                />
                <p className={`text-xs mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Open Microsoft Authenticator / Google Authenticator and enter the 6-digit code for ProjectNova.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className={`w-full py-3 rounded-lg font-bold transition transform duration-300 ${
                  loading || mfaCode.length !== 6
                    ? isLight ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin border-slate-400 border-t-cyan-400" />
                    Verifying...
                  </span>
                ) : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setMfaCode(''); setError('') }}
                className={`w-full text-sm text-center transition ${
                  isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* ── Step 3: FORCED MFA Setup (mandatory enrollment) ── */}
          {step === 'forced_setup' && (
            <form onSubmit={handleForcedSetupVerify} className="space-y-5">
              {/* Mandatory badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/20 border border-amber-500/50">
                <span className="text-lg">⚠️</span>
                <p className="text-xs font-bold text-amber-400">
                  Two-Factor Authentication is required to access ProjectNova. Please set it up now.
                </p>
              </div>

              {/* QR Code section */}
              <div className={`rounded-xl p-4 border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                <p className={`text-xs font-bold mb-3 uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Step 1 — Scan with Microsoft Authenticator / Google Authenticator / Authy
                </p>
                <div className="flex flex-col items-center gap-4">
                  {setupQr && (
                    <img
                      src={setupQr}
                      alt="MFA QR Code"
                      className="w-44 h-44 rounded-xl border-4 border-purple-500/40 bg-white p-1"
                    />
                  )}
                  <div className="w-full">
                    <p className={`text-xs mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Can't scan? Enter this key manually:
                    </p>
                    <code className={`text-xs font-mono px-3 py-2 rounded-lg block break-all text-center ${
                      isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-cyan-400'
                    }`}>
                      {setupSecret}
                    </code>
                  </div>
                </div>
              </div>

              {/* Code input */}
              <div>
                <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Step 2 — Enter the 6-digit code from your app
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setSetupFocus(true)}
                  onBlur={() => setSetupFocus(false)}
                  placeholder="000000"
                  className={`${inputClass(setupFocus)} text-center text-2xl tracking-[0.5em] font-mono`}
                  maxLength={6}
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || setupCode.length !== 6}
                className={`w-full py-3 rounded-lg font-bold transition transform duration-300 ${
                  loading || setupCode.length !== 6
                    ? isLight ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50 hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin border-slate-400 border-t-emerald-400" />
                    Activating MFA...
                  </span>
                ) : '✅ Activate & Continue to Dashboard'}
              </button>
            </form>
          )}

          {/* ── Sign Up Link (only on credentials step) ── */}
          {step === 'credentials' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${isLight ? 'to-slate-300' : 'to-slate-700'}`} />
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Or</span>
                <div className={`flex-1 h-px bg-gradient-to-l from-transparent ${isLight ? 'to-slate-300' : 'to-slate-700'}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Don't have an account?{' '}
                  <a href="/auth/register" className={`font-bold transition duration-300 ${
                    isLight ? 'text-purple-600 hover:text-purple-700' : 'text-cyan-400 hover:text-cyan-300'
                  }`}>
                    Create one
                  </a>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Floating Elements */}
        <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce ${
          isLight ? 'bg-purple-400' : 'bg-purple-600'
        }`} />
        <div className={`absolute -bottom-10 -left-10 w-20 h-20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce ${
          isLight ? 'bg-cyan-400' : 'bg-cyan-600'
        }`} style={{ animationDelay: '1s' }} />
      </div>
    </div>
  )
}
