import React from 'react'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import FeaturedProjects from '../components/FeaturedProjects'
import { motion } from 'framer-motion'
import { 
  HiOutlineArrowRight, 
  HiOutlinePlus, 
  HiOutlineShieldCheck, 
  HiOutlineCloud, 
  HiOutlineLink, 
  HiOutlineCpuChip,
  HiOutlineSparkles
} from 'react-icons/hi2'
import { FaJava, FaPython, FaReact } from 'react-icons/fa'

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
    <div className={`min-h-screen transition-colors duration-300 w-full pointer-events-none ${
      isLight ? 'text-slate-900 bg-transparent' : 'text-white bg-transparent'
    }`}>
      {/* Hero Section */}
      <section className={`relative overflow-hidden pt-32 pb-20 px-4 transition-all duration-300 bg-transparent`}>


        <div className="container relative z-10 max-w-6xl mx-auto pointer-events-auto">
          <div className="text-center mb-12">
            {/* Typing effect heading */}
            <div className="mb-6 h-24 flex items-center justify-center">
              <h1 className={`text-7xl font-black tracking-tighter transition-all duration-300 ${
                isLight
                  ? 'text-transparent bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 bg-clip-text'
                  : 'text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text'
              }`}>
                {displayedText}
                {/* <span className="animate-bounce">☠️</span> */}
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
      <section className={`py-20 px-4 transition-colors duration-300 bg-transparent pointer-events-auto`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { name: 'Python', sub: 'Data & AI', icon: <FaPython />, color: 'from-blue-600 to-yellow-500', path: '/projects?tech=Python' },
              { name: 'Java', sub: 'Backend', icon: <FaJava />, color: 'from-red-600 to-orange-500', path: '/projects?tech=Java' },
              { name: 'Web Dev', sub: 'Frontend & Full Stack', icon: <FaReact />, color: 'from-cyan-500 to-blue-600', path: '/projects?tech=Web' },
              { name: 'Cloud', sub: 'AWS & Azure', icon: <HiOutlineCloud />, color: 'from-orange-400 to-yellow-600', path: '/projects?tech=Cloud' },
              { name: 'Security', sub: 'Cybersecurity', icon: <HiOutlineShieldCheck />, color: 'from-red-600 to-purple-600', path: '/projects?tech=Cybersecurity' },
              { name: 'Blockchain', sub: 'Web3 & Crypto', icon: <HiOutlineLink />, color: 'from-purple-600 to-blue-600', path: '/projects?tech=Blockchain' },
              { name: 'IoT', sub: 'Embedded Systems', icon: <HiOutlineCpuChip />, color: 'from-green-500 to-teal-600', path: '/projects?tech=IoT' },
              { name: 'AI/ML', sub: 'Machine Learning', icon: <HiOutlineSparkles />, color: 'from-orange-500 to-red-600', path: '/projects?tech=AI' }
            ].map((tech, idx) => (
              <motion.a
                key={tech.name}
                href={tech.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative p-8 rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isLight
                    ? 'bg-white/80 border-slate-200 hover:border-transparent hover:shadow-2xl shadow-purple-200/20'
                    : 'bg-slate-900/40 border-slate-800 hover:border-transparent hover:shadow-2xl shadow-purple-900/40'
                }`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                    isLight 
                      ? `bg-gradient-to-br ${tech.color} text-white shadow-lg` 
                      : `bg-gradient-to-br ${tech.color} text-white shadow-lg shadow-black/20`
                  }`}>
                    {tech.icon}
                  </div>
                  
                  <h3 className={`text-xl font-black mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {tech.name}
                  </h3>
                  <p className={`text-sm font-medium mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {tech.sub}
                  </p>
                  
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
                    isLight ? 'text-purple-600' : 'text-cyan-400'
                  }`}>
                    Explore <HiOutlineArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Custom Projects Section */}
      <section className={`py-20 px-4 transition-colors duration-300 bg-transparent pointer-events-auto`}>
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
                <HiOutlinePlus className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
                Request custom project
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
