import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const links = {
    Platform: [
      { label: 'Browse Projects', href: '/projects' },
      { label: 'Custom Projects', href: '/projects/custom' },
      { label: 'Documentation', href: '/docs' },
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Support', href: '/support' },
    ],
  }

  return (
    <footer className={`border-t ${
      isLight ? 'bg-[#fafafa] border-slate-100' : 'bg-[#0a0a0f] border-white/[0.06]'
    }`}>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className={`text-base font-bold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              WastedTeens☠️
            </div>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Premium academic projects for smart students. Instant access, premium quality.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                isLight ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {group}
              </h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`text-sm transition-colors ${
                        isLight
                          ? 'text-slate-500 hover:text-slate-900'
                          : 'text-slate-500 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              isLight ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Connect
            </h4>
            <div className="flex flex-col gap-2">
              {[{ label: 'Twitter', href: '#' }, { label: 'GitHub', href: '#' }, { label: 'Discord', href: '#' }].map(s => (
                <a key={s.label} href={s.href} className={`text-sm transition-colors ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-500 hover:text-slate-200'
                }`}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={`border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'border-slate-100' : 'border-white/[0.06]'
        }`}>
          <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
            © 2026 WastedTeens. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className={`text-xs transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-600 hover:text-slate-400'
            }`}>Privacy</a>
            <a href="#" className={`text-xs transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-600 hover:text-slate-400'
            }`}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
