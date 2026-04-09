import React from 'react'
import { useTheme } from '../context/ThemeContext'

const pricingTiers = [
  {
    name: 'Starter',
    price: 499,
    description: 'Essential project resources to get you started.',
    features: ['Source Code', 'Documentation', 'Setup Guide', 'Code Comments'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 999,
    description: 'Everything you need to learn and present your project.',
    features: ['Everything in Starter', 'PowerPoint Presentation', 'Project Report', 'Video Tutorials'],
    highlighted: true,
  },
  {
    name: 'Master',
    price: 1999,
    description: 'Complete package with support and deployment help.',
    features: ['Everything in Pro', '1-on-1 Support', 'Deployment Help', 'Source Code Updates', 'Research Paper', 'Viva Q&A Support'],
    highlighted: false,
  },
]

const faqs = [
  { q: 'Can I upgrade my tier later?', a: 'Yes! You can upgrade anytime and only pay the difference.' },
  { q: 'Is there a refund policy?', a: '30-day money-back guarantee, no questions asked.' },
  { q: 'Do you offer custom projects?', a: 'Absolutely. Use the Custom Projects page to submit your requirements.' },
  { q: 'Are lifetime updates included?', a: 'Yes, all purchases include updates at no extra cost.' },
]

export default function Pricing() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 ${
      isLight ? 'bg-white text-slate-900' : 'bg-[#0a0a0f] text-white'
    }`}>
      <div className="container max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Simple, transparent pricing
          </h1>
          <p className={`text-lg max-w-xl mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Choose the right tier for every project. Instant access, lifetime updates.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-16 items-start">
          {pricingTiers.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-[14px] border p-7 transition-all duration-200 ${
                tier.highlighted
                  ? isLight
                    ? 'bg-slate-900 border-slate-800 text-white shadow-xl'
                    : 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                  : isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              {/* Popular badge */}
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    isLight ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'
                  }`}>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-base font-semibold mb-1 ${
                  tier.highlighted ? 'text-white' : isLight ? 'text-slate-900' : 'text-white'
                }`}>{tier.name}</h3>
                <p className={`text-sm ${
                  tier.highlighted ? 'text-white/70' : isLight ? 'text-slate-500' : 'text-slate-500'
                }`}>{tier.description}</p>
              </div>

              <div className="mb-7">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${
                    tier.highlighted ? 'text-white' : isLight ? 'text-slate-900' : 'text-white'
                  }`}>₹{tier.price}</span>
                  <span className={`text-sm ${
                    tier.highlighted ? 'text-white/60' : isLight ? 'text-slate-400' : 'text-slate-500'
                  }`}>/project</span>
                </div>
              </div>

              <a
                href="/projects"
                className={`block text-center py-2.5 rounded-[10px] text-sm font-semibold mb-7 transition-all duration-150 ${
                  tier.highlighted
                    ? isLight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : isLight
                      ? 'border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      : 'border border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                Get started
              </a>

              <ul className="space-y-3">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      tier.highlighted ? 'text-white/80' : isLight ? 'text-indigo-500' : 'text-indigo-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${
                      tier.highlighted ? 'text-white/85' : isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className={`text-2xl font-bold tracking-tight text-center mb-8 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>Frequently asked questions</h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-[12px] border p-5 ${
                isLight
                  ? 'border-slate-100 bg-slate-50/60'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}>
                <h3 className={`text-sm font-semibold mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{faq.q}</h3>
                <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className={`text-sm mb-3 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Still have questions?</p>
            <a href="/support" className={`btn ${isLight ? 'btn-secondary' : 'btn-secondary'}`}>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
