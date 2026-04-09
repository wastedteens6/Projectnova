import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Docs() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const sections = [
    {
      title: 'Getting Started',
      emoji: '🚀',
      content: 'WastedTeens provides production-ready project source codes with comprehensive documentation and tutorials. Choose your tier, download the project, and start learning immediately.'
    },
    {
      title: 'Installation Guide',
      emoji: '⚙️',
      code: `# Clone the project
git clone <project-repo>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev`
    },
    {
      title: 'API Documentation',
      emoji: '📚',
      content: 'All projects include detailed API endpoint documentation with examples for authentication, data fetching, and mutations. Check the /docs folder in your project for complete reference.'
    },
    {
      title: 'Deployment',
      emoji: '🌐',
      content: 'Ready to deploy? Each project includes deployment guides for popular platforms like Vercel, Heroku, AWS, and Firebase. Follow the platform-specific instructions in the deployment folder.'
    }
  ]

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>
          <p className={`text-lg transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>Everything you need to get started with your project</p>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className={`backdrop-blur-lg border rounded-2xl p-8 hover:border-slate-600/50 transition duration-300 ${
              isLight
                ? 'border-slate-200 bg-slate-50/40'
                : 'border-slate-700/50 bg-slate-900/40'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{section.emoji}</span>
                <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                  isLight ? 'text-purple-600' : 'text-cyan-400'
                }`}>{section.title}</h2>
              </div>
              
              {section.code ? (
                <div className={`rounded-lg p-4 border overflow-x-auto transition-all duration-300 ${
                  isLight
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-slate-800/50 border-slate-700'
                }`}>
                  <pre className={`font-mono text-sm whitespace-pre-wrap transition-colors duration-300 ${
                    isLight ? 'text-purple-700' : 'text-cyan-300'
                  }`}>{section.code}</pre>
                </div>
              ) : (
                <p className={`leading-relaxed transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>{section.content}</p>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className={`mt-16 p-8 backdrop-blur-lg border rounded-2xl transition-all duration-300 ${
          isLight
            ? 'border-slate-200 bg-slate-50/40'
            : 'border-slate-700/50 bg-slate-900/40'
        }`}>
          <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            isLight ? 'text-purple-600' : 'text-cyan-400'
          }`}>📖 Quick Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Environment Setup', desc: 'Configure your local development environment' },
              { title: 'Project Structure', desc: 'Understand the folder organization and architecture' },
              { title: 'Database Guide', desc: 'Learn about database setup and migrations' },
              { title: 'Troubleshooting', desc: 'Common issues and their solutions' }
            ].map((link, i) => (
              <a key={i} href="#" className={`p-4 rounded-lg border transition duration-300 ${
                isLight
                  ? 'border-slate-300 hover:border-purple-400 hover:bg-slate-100'
                  : 'border-slate-700 hover:border-cyan-500 hover:bg-slate-800/50'
              }`}>
                <p className={`font-bold transition-colors duration-300 ${
                  isLight ? 'text-purple-600' : 'text-cyan-400'
                }`}>{link.title}</p>
                <p className={`text-sm transition-colors duration-300 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>{link.desc}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Support CTA */}
        <div className="mt-12 text-center">
          <p className={`mb-6 transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>Can't find what you're looking for?</p>
          <a href="/support" className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105">
            💬 Get Support
          </a>
        </div>
      </div>
    </div>
  )
}
