import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import axios from 'axios'

export default function AdminSettings() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { settings: globalSettings, updateSettings, refreshSettings } = useSettings()
  const isLight = theme === 'light'
  const dk = !isLight
  
  const [activeTab, setActiveTab] = useState<'branding' | 'security' | 'system'>('branding')
  const [localSettings, setLocalSettings] = useState(globalSettings)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setLocalSettings(globalSettings)
  }, [globalSettings])

  // MFA State
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaSetupStep, setMfaSetupStep] = useState<'idle' | 'scan' | 'disable'>('idle')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaQr, setMfaQr] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaDisableCode, setMfaDisableCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState('')
  const [mfaSuccess, setMfaSuccess] = useState('')

  const API_BASE_URL = '${import.meta.env.VITE_API_URL||'http://localhost:5000'}/api'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const ToggleSwitch = ({ checked, onChange, name }: { checked: boolean, onChange: any, name: string }) => (
    <div 
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-purple-600' : 'bg-slate-600'}`}
      onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked }})}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  )

  const handleSave = async () => {
    const success = await updateSettings(localSettings);
    if (success) {
      setMfaSuccess('Settings saved successfully!');
      setTimeout(() => setMfaSuccess(''), 3000);
    } else {
      setMfaError('Failed to save settings.');
      setTimeout(() => setMfaError(''), 3000);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMfaError('');
    setMfaSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/settings/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        await refreshSettings();
        setMfaSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'} updated successfully!`);
      }
    } catch (err: any) {
      setMfaError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Fetch MFA status on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.user?.mfa_enabled !== undefined) setMfaEnabled(res.data.user.mfa_enabled) })
      .catch(() => {})
  }, [])

  const handleMfaSetup = async () => {
    setMfaLoading(true); setMfaError(''); setMfaSuccess('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(`${API_BASE_URL}/auth/mfa/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.data.success) throw new Error(res.data.error)
      setMfaQr(res.data.qrDataUrl)
      setMfaSecret(res.data.secret)
      setMfaSetupStep('scan')
    } catch (err: any) {
      setMfaError(err.response?.data?.error || err.message || 'Setup failed')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleMfaVerifySetup = async () => {
    if (mfaCode.length !== 6) return
    setMfaLoading(true); setMfaError('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(`${API_BASE_URL}/auth/mfa/verify-setup`, 
        { code: mfaCode },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.data.success) throw new Error(res.data.error)
      setMfaEnabled(true); setMfaSetupStep('idle')
      setMfaSuccess('🎉 MFA enabled! You will need your authenticator app on future logins.')
      setMfaCode('')
    } catch (err: any) {
      setMfaError(err.response?.data?.error || err.message || 'Invalid code')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleMfaDisable = async () => {
    if (mfaDisableCode.length !== 6) return
    setMfaLoading(true); setMfaError('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(`${API_BASE_URL}/auth/mfa/disable`, 
        { code: mfaDisableCode },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.data.success) throw new Error(res.data.error)
      setMfaEnabled(false); setMfaSetupStep('idle'); setMfaDisableCode('')
      setMfaSuccess('MFA disabled. Your account is now protected by password only.')
    } catch (err: any) {
      setMfaError(err.response?.data?.error || err.message || 'Invalid code')
    } finally {
      setMfaLoading(false)
    }
  }

  // ── Style shortcuts ───────────────────────────────────────────────────────
  const surface  = dk ? 'bg-transparent text-white'       : 'bg-transparent text-slate-900'
  const border   = dk ? 'border-slate-800/60'             : 'border-slate-200'
  const muted    = dk ? 'text-slate-400'                  : 'text-slate-500'
  const cardBg   = dk ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'
  const inputBg  = dk ? 'bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-400'

  const TabButton = ({ id, label, icon }: { id: string, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 relative ${
        activeTab === id 
          ? (dk ? 'text-purple-400' : 'text-purple-600')
          : (dk ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
      }`}
    >
      <span>{icon}</span>
      {label}
      {activeTab === id && (
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${dk ? 'bg-purple-500' : 'bg-purple-600'}`} />
      )}
    </button>
  )

  return (
    <div className={`min-h-screen ${surface}`}>
      {/* Alert */}
      {(mfaError || mfaSuccess) && (
        <div className={`fixed top-20 right-6 px-4 py-2 text-xs font-bold rounded-lg z-50 animate-fade-in border shadow-lg ${
          mfaSuccess ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
        }`}>
          {mfaSuccess || mfaError}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={`border-b ${border} transition-all duration-300 ${dk ? 'bg-slate-900/50 backdrop-blur-md' : 'bg-white/50 backdrop-blur-md'}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <h1 className="text-lg font-bold whitespace-nowrap">Settings</h1>
            <span className={`text-xs font-medium hidden md:inline ${muted}`}>System configuration</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${dk ? 'border-slate-700 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >← Back</button>
        </div>
      </header>

      {/* ── Tabs Navigation ────────────────────────────────────────────────── */}
      <div className={`border-b ${border} ${dk ? 'bg-slate-900/20' : 'bg-slate-50/50'}`}>
        <div className="max-w-screen-xl mx-auto px-6 flex items-center h-12 gap-2">
          <TabButton id="branding" label="Branding" icon="✨" />
          <TabButton id="security" label="Security" icon="🔐" />
          <TabButton id="system" label="System Settings" icon="⚙️" />
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <main className="max-w-3xl">
          
          {activeTab === 'branding' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className={`p-8 rounded-2xl border ${cardBg}`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">Branding</h3>
                <div className="space-y-8">
                  {/* Image Uploads */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Logo Section */}
                    <div className="flex flex-col gap-3">
                      <label className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Brand Logo</label>
                      <div className={`relative group aspect-video rounded-xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden ${dk ? 'border-slate-700 bg-slate-800/20 hover:border-purple-500' : 'border-slate-200 bg-slate-50 hover:border-purple-400'}`}>
                        {globalSettings.logo ? (
                          <img src={`${import.meta.env.VITE_API_URL||'http://localhost:5000'}${globalSettings.logo}`} alt="Brand Logo" className="w-full h-full object-contain p-4 transition group-hover:scale-105" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">🖼️</span>
                            <span className={`text-[10px] font-bold ${muted}`}>Click to upload logo</span>
                          </div>
                        )}
                        {/* Hidden Input Overlay */}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'logo')} 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          disabled={uploading} 
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-white text-xs font-bold mb-1">{uploading ? 'Uploading...' : 'Change Logo'}</span>
                          <span className="text-white/60 text-[10px]">JPG, PNG, SVG (Max 2MB)</span>
                        </div>
                      </div>
                    </div>

                    {/* Favicon Section */}
                    <div className="flex flex-col gap-3">
                      <label className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Favicon</label>
                      <div className={`relative group w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden ${dk ? 'border-slate-700 bg-slate-800/20 hover:border-purple-500' : 'border-slate-200 bg-slate-50 hover:border-purple-400'}`}>
                        {globalSettings.favicon ? (
                          <img src={`${import.meta.env.VITE_API_URL||'http://localhost:5000'}${globalSettings.favicon}`} alt="Favicon" className="w-full h-full object-contain p-2 transition group-hover:scale-105" />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xl">🎨</span>
                            <span className={`text-[10px] font-bold ${muted}`}>Upload</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'favicon')} 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          disabled={uploading} 
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-white text-[10px] font-bold">{uploading ? '...' : 'Change'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Site Name</label>
                      <input
                        type="text" name="siteName" value={localSettings.siteName} onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Site Email</label>
                      <input
                        type="email" name="siteEmail" value={localSettings.siteEmail} onChange={handleChange}
                        className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} className="mt-10 w-full py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
                  <span>💾</span> Save Branding Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className={`p-8 rounded-2xl border ${cardBg}`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">Security</h3>
                
                <div className="space-y-4 mb-8">
                  <div className={`flex items-center justify-between p-5 rounded-xl border transition-all ${dk ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <label className="text-sm font-bold">Require Two-Factor Authentication (2FA) for All Users</label>
                      <p className={`text-xs mt-0.5 ${muted}`}>Forces all users to set up MFA before accessing their dashboard.</p>
                    </div>
                    <ToggleSwitch checked={localSettings.mfaRequired} onChange={handleChange} name="mfaRequired" />
                  </div>

                  <div className={`p-6 rounded-xl border ${dk ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold">Your Administrator 2FA</h4>
                        <p className={`text-[10px] mt-0.5 ${muted}`}>Protect your admin account with an authenticator app.</p>
                      </div>
                      {mfaEnabled && <span className="px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-bold bg-green-500/10 text-green-500 border border-green-500/20">Secured</span>}
                    </div>
                    
                    {!mfaEnabled && mfaSetupStep === 'idle' && (
                      <button onClick={handleMfaSetup} disabled={mfaLoading} className="w-full py-3 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition">Set up MFA Protection</button>
                    )}
                    {mfaEnabled && mfaSetupStep === 'idle' && (
                      <button onClick={() => setMfaSetupStep('disable')} className="text-xs font-bold text-red-500 hover:underline">Disable MFA Protection</button>
                    )}
                    
                    {mfaSetupStep === 'scan' && (
                      <div className="space-y-6 pt-4 border-t border-slate-700/30">
                        <div className="flex gap-6 items-center">
                          <div className="bg-white p-2 rounded-lg shrink-0">
                            <img src={mfaQr} className="w-28 h-28" alt="QR Code" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <p className="text-xs leading-relaxed">Scan this code with Google Authenticator or Authy. If you can't scan, use the key below:</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[10px] p-2 bg-slate-800 rounded font-mono text-purple-400 tracking-wider">{mfaSecret}</code>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <input type="text" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className={`flex-1 px-4 py-2.5 text-sm text-center tracking-[0.4em] font-bold rounded-lg border outline-none ${inputBg}`} />
                          <button onClick={handleMfaVerifySetup} className="px-6 py-2.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition">Verify & Enable</button>
                          <button onClick={() => setMfaSetupStep('idle')} className={`px-4 py-2.5 rounded-lg text-xs font-bold ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {mfaSetupStep === 'disable' && (
                      <div className="space-y-4 pt-4 border-t border-slate-700/30">
                        <p className="text-xs text-red-500 font-bold">Danger: You are about to remove 2FA protection. Enter your current code to confirm.</p>
                        <div className="flex gap-3">
                          <input type="text" maxLength={6} value={mfaDisableCode} onChange={e => setMfaDisableCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className={`flex-1 px-4 py-2.5 text-sm text-center tracking-[0.4em] font-bold rounded-lg border outline-none ${inputBg}`} />
                          <button onClick={handleMfaDisable} className="px-6 py-2.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition">Confirm Disable</button>
                          <button onClick={() => setMfaSetupStep('idle')} className={`px-4 py-2.5 rounded-lg text-xs font-bold ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Keep 2FA</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <span>🔑</span> Change Administrator Password
                </h4>
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Current Password</label>
                    <input type="password" placeholder="••••••••" className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition ${inputBg}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>New Password</label>
                      <input type="password" placeholder="••••••••" className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition ${inputBg}`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Confirm Password</label>
                      <input type="password" placeholder="••••••••" className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition ${inputBg}`} />
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} className="mt-10 w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
                  Update Password & Security
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className={`p-8 rounded-2xl border ${cardBg}`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">System Settings</h3>
                
                <div className="space-y-8">
                  <div className={`flex items-center justify-between p-6 rounded-xl border transition-all ${dk ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <label className="text-sm font-bold">Global Maintenance Mode</label>
                      <p className={`text-xs mt-1 ${muted}`}>When enabled, the site will be offline for everyone except administrators.</p>
                    </div>
                    <ToggleSwitch checked={localSettings.maintenanceMode} onChange={handleChange} name="maintenanceMode" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-700/30">
                    <div className="flex flex-col gap-2">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Default Currency</label>
                      <select name="currency" value={localSettings.currency} onChange={handleChange} className={`w-full px-4 py-3 text-sm rounded-lg border outline-none transition ${inputBg}`}>
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Platform Tax Rate (%)</label>
                      <input type="number" name="taxRate" value={localSettings.taxRate} onChange={handleChange} className={`w-full px-4 py-3 text-sm rounded-lg border outline-none transition ${inputBg}`} />
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} className="mt-10 w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition">
                  Save System Configurations
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
