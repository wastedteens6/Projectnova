import React from 'react'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import FeaturedProjects from '../components/FeaturedProjects'

export default function Home() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [displayedText, setDisplayedText] = useState('')
  const fullText = 'Wasted Teens'
  const [textIndex, setTextIndex] = useState(0)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (textIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, textIndex + 1))
        setTextIndex(textIndex + 1)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [textIndex])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      window.location.href = `/projects?search=${encodeURIComponent(searchInput)}`
    }
  }

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 w-full ${
      isLight ? 'text-slate-900 bg-transparent' : 'text-white bg-transparent'
    }`}>
      {/* Hero Section */}
      <section className={`relative overflow-hidden pt-32 pb-20 px-4 transition-all duration-300 bg-transparent`}>
        {/* Background gradient animation */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          isLight
            ? 'bg-gradient-to-br from-purple-100/10 via-transparent to-cyan-100/10'
            : 'bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10'
        }`}></div>
        
        {/* Animated background elements */}
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob transition-colors duration-300 ${
          isLight ? 'bg-purple-400' : 'bg-purple-500'
        }`}></div>
        <div className={`absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000 transition-colors duration-300 ${
          isLight ? 'bg-cyan-400' : 'bg-cyan-500'
        }`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000 transition-colors duration-300 ${
          isLight ? 'bg-blue-400' : 'bg-blue-500'
        }`}></div>

        <div className="container relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            {/* Typing effect heading */}
            <div className="mb-6 h-24 flex items-center justify-center">
              <h1 className={`text-7xl font-black tracking-tighter transition-all duration-300 ${
                isLight
                  ? 'text-transparent bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 bg-clip-text'
                  : 'text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text'
              }`}>
                {displayedText}
                <span className="animate-bounce">☠️</span>
              </h1>
            </div>

            {/* Main heading */}
            <h2 className={`text-5xl font-bold mb-6 leading-tight transition-all duration-300 ${
              isLight ? 'text-slate-800' : 'text-white'
            }`}>
              Stop Wasting Time.<br />
              <span className={`bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 ${
                isLight
                  ? 'from-purple-600 to-cyan-600'
                  : 'from-cyan-400 to-purple-400'
              }`}>Buy Smart Projects</span>
            </h2>

            {/* Subheading */}
            <p className={`text-xl mb-12 max-w-2xl mx-auto transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Ready-made academic projects for AI, ML, Web Development, Cybersecurity & more. 
              <br />
              Instant download. Premium quality. Student-approved.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search for projects... (AI, ML, Web Dev, etc.)"
                  value={searchInput}
                  onChange={handleSearchChange}
                  className={`flex-1 px-6 py-4 rounded-lg border-2 transition duration-300 focus:outline-none ${
                    isLight
                      ? 'border-purple-300 bg-white text-slate-900 placeholder-slate-500 focus:border-purple-600 focus:shadow-lg focus:shadow-purple-200'
                      : 'border-cyan-500/30 bg-slate-900/50 text-white placeholder-slate-400 focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/30'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-8 py-4 rounded-lg font-bold transition transform duration-300 whitespace-nowrap ${
                    isLight
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                      : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                  }`}
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex gap-6 justify-center flex-wrap">
              <a href="/projects" className={`group relative px-8 py-4 font-bold text-lg transition-all duration-300 ${
                isLight ? 'text-white' : 'text-white'
              }`}>
                <div className={`absolute inset-0 rounded-lg blur group-hover:blur-md transition duration-300 opacity-75 group-hover:opacity-100 ${
                  isLight
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600'
                }`}></div>
                <div className={`relative px-8 py-4 rounded-lg flex items-center gap-2 transition-colors duration-300 ${
                  isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
                }`}>
                  Explore Projects
                  <span>→</span>
                </div>
              </a>
            </div>

            {/* Floating stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className={`p-4 rounded-lg border transition-all duration-300 ${
                isLight
                  ? 'border-purple-300 bg-white/80 hover:bg-white shadow-sm shadow-purple-200/50'
                  : 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'
              }`}>
                <div className={`text-3xl font-bold transition-colors duration-300 ${
                  isLight ? 'text-purple-600' : 'text-purple-400'
                }`}>500+</div>
                <div className={`text-sm transition-colors duration-300 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>Projects</div>
              </div>
              <div className={`p-4 rounded-lg border transition-all duration-300 ${
                isLight
                  ? 'border-cyan-300 bg-white/80 hover:bg-white shadow-sm shadow-cyan-200/50'
                  : 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10'
              }`}>
                <div className={`text-3xl font-bold transition-colors duration-300 ${
                  isLight ? 'text-cyan-600' : 'text-cyan-400'
                }`}>10K+</div>
                <div className={`text-sm transition-colors duration-300 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>Students</div>
              </div>
              <div className={`p-4 rounded-lg border transition-all duration-300 ${
                isLight
                  ? 'border-blue-300 bg-white/80 hover:bg-white shadow-sm shadow-blue-200/50'
                  : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10'
              }`}>
                <div className={`text-3xl font-bold transition-colors duration-300 ${
                  isLight ? 'text-blue-600' : 'text-blue-400'
                }`}>⭐ 4.9</div>
                <div className={`text-sm transition-colors duration-300 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>Ratings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Cards Section */}
      <section className={`py-20 px-4 transition-colors duration-300 bg-transparent`}>
        <div className="container max-w-6xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-3 transition-colors duration-300 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>Explore by Technology</h2>
            <p className={`text-lg transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>Find projects built with the tech stack you're learning</p>
          </div>

          {/* Technology Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {/* Python */}
            <a href="/projects?tech=Python" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-blue-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-blue-100 to-blue-50' : 'bg-gradient-to-br from-blue-900/40 to-blue-800/40'
              }`}>
                🐍
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Python</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Data & AI</p>
              </div>
            </a>

            {/* Java */}
            <a href="/projects?tech=Java" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-orange-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-orange-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-orange-100 to-orange-50' : 'bg-gradient-to-br from-orange-900/40 to-orange-800/40'
              }`}>
                ☕
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Java</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Backend</p>
              </div>
            </a>

            {/* Web Development */}
            <a href="/projects?tech=Web" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-yellow-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-yellow-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-yellow-100 to-yellow-50' : 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/40'
              }`}>
                🌐
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Web Dev</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Frontend & Full Stack</p>
              </div>
            </a>

            {/* Cloud Computing */}
            <a href="/projects?tech=Cloud" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-cyan-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-cyan-100 to-cyan-50' : 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/40'
              }`}>
                ☁️
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Cloud</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>AWS & Azure</p>
              </div>
            </a>

            {/* Cybersecurity */}
            <a href="/projects?tech=Cybersecurity" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-red-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-red-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-red-100 to-red-50' : 'bg-gradient-to-br from-red-900/40 to-red-800/40'
              }`}>
                🔒
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Security</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Cybersecurity</p>
              </div>
            </a>

            {/* Blockchain */}
            <a href="/projects?tech=Blockchain" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-purple-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-purple-100 to-purple-50' : 'bg-gradient-to-br from-purple-900/40 to-purple-800/40'
              }`}>
                ⛓️
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Blockchain</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Web3 & Crypto</p>
              </div>
            </a>

            {/* IoT */}
            <a href="/projects?tech=IoT" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-green-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-green-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-green-100 to-green-50' : 'bg-gradient-to-br from-green-900/40 to-green-800/40'
              }`}>
                📡
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>IoT</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Embedded Systems</p>
              </div>
            </a>

            {/* Machine Learning */}
            <a href="/projects?tech=AI" className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 hover:border-indigo-300'
                : 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50'
            }`}>
              <div className={`h-48 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 text-6xl ${
                isLight ? 'bg-gradient-to-br from-indigo-100 to-indigo-50' : 'bg-gradient-to-br from-indigo-900/40 to-indigo-800/40'
              }`}>
                🤖
              </div>
              <div className={`p-4 text-center transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-slate-800'}`}>
                <h3 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>AI/ML</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Machine Learning</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Custom Projects Section */}
      <section className={`py-20 px-4 transition-colors duration-300 bg-transparent`}>
        <div className="container max-w-6xl mx-auto">
          <div className={`rounded-3xl border-2 backdrop-blur-lg p-16 md:p-20 text-center transition-all duration-300 ${
            isLight
              ? 'bg-white/50 border-purple-200/30 hover:border-purple-300/50 shadow-lg shadow-purple-200/20'
              : 'bg-slate-900/50 border-purple-500/20 hover:border-purple-500/40 shadow-lg shadow-purple-900/20'
          }`}>
            <h2 className={`text-5xl md:text-6xl font-black mb-6 transition-colors duration-300 ${
              isLight 
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'
            }`}>
              Have a project idea?
            </h2>
            
            <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed transition-colors duration-300 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Tell us your requirements and we'll build a custom project tailored to your needs. From concept to completion, we've got you covered.
            </p>
            
            <a href="/projects/custom" className="group relative inline-block">
              <div className={`absolute inset-0 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-60 group-hover:opacity-100 ${
                isLight
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600'
              }`}></div>
              <button className={`relative px-10 md:px-12 py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 flex items-center gap-3 group-hover:scale-105 group-hover:shadow-2xl ${
                isLight 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              }`}>
                <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span>
                Request custom project
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
