import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Home() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      window.location.href = `/projects?search=${encodeURIComponent(searchInput)}`
    }
  }

  const stats = [
    { value: '500+', label: 'Projects' },
    { value: '10K+', label: 'Students' },
    { value: '4.9★', label: 'Rating' },
  ]

  const categories = ['AI & ML', 'Web Development', 'Cybersecurity', 'Data Science', 'IoT']

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-[#0a0a0f] text-white'}`}>

      {/* Hero Section */}
      <section className={`pt-28 pb-20 px-4 ${isLight ? '' : ''}`}>
        <div className="container max-w-4xl mx-auto text-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isLight
                ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              ✦ Ready-made academic projects
            </span>
          </div>

          <h1 className={`text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Stop wasting time.<br />
            <span className="text-indigo-600">Buy smart projects.</span>
          </h1>

          <p className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Premium academic projects for AI, ML, Web Dev, Cybersecurity & more.
            Instant download. Student-approved quality.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
            <div className={`flex gap-2 p-1.5 rounded-[12px] border ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-white/5 border-white/10'
            }`}>
              <input
                type="text"
                placeholder="Search for AI, Web Dev, Cybersecurity..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className={`flex-1 px-4 py-2 text-sm bg-transparent focus:outline-none ${
                  isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-500'
                }`}
              />
              <button type="submit" className="btn btn-primary btn-sm px-5">
                Search
              </button>
            </div>
          </form>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <a href="/projects" className="btn btn-primary btn-lg">
              Explore Projects
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="/pricing" className={`btn btn-lg ${isLight ? 'btn-secondary' : 'btn-secondary'}`}>
              View Pricing
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.value}</div>
                <div className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={`py-16 px-4 border-t ${
        isLight ? 'bg-slate-50/60 border-slate-100' : 'bg-white/[0.02] border-white/[0.06]'
      }`}>
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-3 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Browse by category
            </h2>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Find the right project for your domain
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <a
                key={cat}
                href={`/projects?search=${encodeURIComponent(cat)}`}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 hover:-translate-y-0.5 ${
                  isLight
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:text-indigo-700 shadow-sm'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-indigo-500/30 hover:text-indigo-400'
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Project CTA */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className={`rounded-2xl p-10 sm:p-14 text-center border ${
            isLight
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white/[0.03] border-white/[0.08]'
          }`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Have a custom requirement?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              Tell us your idea and we'll build a fully custom project tailored to your needs.
            </p>
            <a href="/projects/custom" className="btn btn-primary btn-lg">
              Request Custom Project
              <span>✨</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
