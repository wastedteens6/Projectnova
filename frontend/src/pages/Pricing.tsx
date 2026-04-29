import React from 'react'
import { useTheme } from '../context/ThemeContext'

const pricingTiers = [
  {
    name: 'Starter',
    price: 2499,
    description: 'Perfect for beginners',
    icon: '🚀',
    features: ['Source Code', 'Documentation', 'Setup Guide', 'Code Comments'],
    color: 'from-blue-600 to-cyan-600'
  },
  {
    name: 'Pro',
    price: 3499,
    description: 'For learning enthusiasts',
    icon: '⭐',
    features: ['Everything in Starter', 'PowerPoint Presentation', 'Project Report', 'Video Tutorials'],
    highlighted: true,
    color: 'from-purple-600 to-pink-600'
  },
  {
    name: 'Master',
    price: 4499,
    description: 'Complete mastery',
    icon: '🎯',
    features: ['Everything in Pro', 'One-on-One Support', 'Deployment Help', 'Source Code Updates', 'Comprehensive Research Paper', 'Viva Questions Support'],
    color: 'from-cyan-600 to-blue-600'
  }
]

export default function Pricing() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-all duration-300 pointer-events-none ${
      isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      <div className="container max-w-6xl mx-auto pointer-events-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Choose the perfect tier for your learning journey. All plans include instant access and lifetime updates.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {pricingTiers.map((tier, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                tier.highlighted
                  ? 'border-transparent md:scale-105 md:z-10'
                  : isLight
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Gradient Border */}
              {tier.highlighted && (
                <div className={`absolute inset-0 bg-gradient-to-r ${tier.color} opacity-20 blur`}></div>
              )}

              {/* Card Container */}
              <div className={`relative z-10 p-8 h-full rounded-2xl transition-all duration-300 ${
                tier.highlighted
                  ? isLight
                    ? 'bg-gradient-to-br from-slate-50/95 to-slate-100/95 border-2 border-gradient-to-r from-purple-500 to-cyan-500'
                    : 'bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-2 border-gradient-to-r from-purple-500 to-cyan-500'
                  : isLight
                    ? 'bg-slate-50/50 backdrop-blur'
                    : 'bg-slate-900/50 backdrop-blur'
              }`}>
                {/* Most Popular Badge */}
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                      ⚡ Most Popular
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="text-5xl mb-4">{tier.icon}</div>

                {/* Tier Name */}
                <h3 className={`text-2xl font-bold mb-2 group-hover:text-cyan-400 transition duration-300 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>{tier.name}</h3>

                {/* Description */}
                <p className={`text-sm mb-6 transition-colors duration-300 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>{tier.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black transition-colors duration-300 ${tier.highlighted ? 'text-transparent bg-gradient-to-r ' + tier.color + ' bg-clip-text' : isLight ? 'text-slate-900' : 'text-white'}`}>
                      ₹{tier.price}
                    </span>
                    <span className={`text-sm transition-colors duration-300 ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>/project</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-bold mb-8 transition transform hover:scale-105 duration-300 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r ' + tier.color + ' text-white shadow-lg shadow-purple-500/50 hover:shadow-lg hover:shadow-purple-500/50'
                      : isLight
                        ? 'border border-slate-300 text-slate-900 hover:border-purple-600 hover:text-purple-600'
                        : 'border border-slate-600 text-slate-200 hover:border-cyan-500 hover:text-cyan-400'
                  }`}
                >
                  Get Started
                </button>

                {/* Features List */}
                <ul className="space-y-4">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className={`font-bold mt-1 flex-shrink-0 transition-colors duration-300 ${
                        isLight ? 'text-purple-600' : 'text-cyan-400'
                      }`}>✓</span>
                      <span className={`text-sm group-hover:font-semibold transition duration-300 ${
                        isLight ? 'text-slate-700' : 'text-slate-300 group-hover:text-white'
                      }`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className={`text-3xl font-bold mb-12 text-center transition-colors duration-300 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              { q: 'Can I upgrade my tier later?', a: 'Yes! You can upgrade anytime. Pay the difference and get instant access to premium features.' },
              { q: 'Is there a refund policy?', a: '30-day money-back guarantee if you\'re not satisfied. No questions asked.' },
              { q: 'Do you offer custom plans?', a: 'Absolutely! Contact our support team for enterprise solutions tailored to your needs.' },
              { q: 'Are lifetime updates included?', a: 'Yes, all projects receive regular updates and improvements at no extra cost.' }
            ].map((faq, i) => (
              <div key={i} className={`p-6 rounded-lg border transition-all duration-300 ${
                isLight
                  ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                  : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900/70'
              }`}>
                <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                  isLight ? 'text-purple-600' : 'text-cyan-400'
                }`}>{faq.q}</h3>
                <p className={`transition-colors duration-300 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <p className={`mb-6 transition-colors duration-300 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>Still have questions?</p>
          <a href="/support" className={`inline-block px-8 py-4 rounded-lg border font-bold transition duration-300 ${
            isLight
              ? 'border-purple-600 text-purple-600 hover:bg-purple-100'
              : 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10'
          }`}>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
