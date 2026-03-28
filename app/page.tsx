'use client'

import { useState } from 'react'

interface QuickRoastResponse {
  overallScore: number
  roastSummary: string
  issues: Array<{
    category: string
    issue: string
    roast: string
    severity: 'critical' | 'major' | 'minor'
  }>
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [roastData, setRoastData] = useState<QuickRoastResponse | null>(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(3)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleRoast = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    setLoading(true)
    setError('')
    setRoastData(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate roast')
        return
      }

      setRoastData(data.roast)
      setRemaining(data.remaining)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    if (!url.trim()) {
      setError('Please enter a website URL first')
      return
    }

    sessionStorage.setItem('auditUrl', url.trim())

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          window.location.href = data.url
        } else {
          setError('Failed to create checkout session')
        }
      })
      .catch(() => {
        setError('Failed to create checkout session')
      })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-16 px-4 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Your Website, Roasted
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-12">
            Get brutally honest feedback on your website's design, copy, UX, and conversion potential. Free quick roast or paid full audit with detailed recommendations.
          </p>

          {/* URL Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleRoast()}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleRoast}
                disabled={loading || !url.trim()}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-6 rounded-lg whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path stroke="currentColor" strokeWidth="2" d="M12 2a10 10 0 0 1 0 20" />
                    </svg>
                    Roasting...
                  </span>
                ) : (
                  'Roast My Website'
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {remaining > 0 ? `${remaining} free roasts remaining this hour` : 'Rate limit reached. Please try again later.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Quick Roast Results */}
          {roastData && (
            <div className="space-y-6">
              {/* Score Badge */}
              <div className="bg-white rounded-xl shadow-lg p-8 inline-block">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="8"
                      strokeDasharray={`${(roastData.overallScore / 100) * 339.292} 339.292`}
                      className="transition-all duration-1000"
                    />
                    <text
                      x="60"
                      y="65"
                      textAnchor="middle"
                      fontSize="32"
                      fontWeight="bold"
                      fill="#111827"
                    >
                      {roastData.overallScore}
                    </text>
                    <text x="60" y="80" textAnchor="middle" fontSize="12" fill="#6b7280">
                      / 100
                    </text>
                  </svg>
                </div>
              </div>

              {/* Roast Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Roast</h3>
                <p className="text-gray-600 italic">"{roastData.roastSummary}"</p>
              </div>

              {/* Issues Table */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 overflow-x-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Issues Found</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Issue</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roastData.issues.map((issue, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{issue.category}</td>
                        <td className="py-3 px-4 text-gray-600">{issue.issue}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              issue.severity === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : issue.severity === 'major'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 md:p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Want the Full Audit?</h3>
                <p className="text-gray-600 mb-6">
                  Get detailed analysis across 8 categories, rewritten copy suggestions, and a prioritized action plan.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  Upgrade to Full Audit - $9.99
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-600">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Enter Your URL</h3>
              <p className="text-gray-600">Paste your website URL and we'll fetch and analyze the content</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-600">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Claude AI analyzes your site for design, copy, UX, and conversion issues</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-600">3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">Receive actionable feedback with a score and specific recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs Pro Comparison */}
      <section className="py-16 md:py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Free vs Pro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Quick Roast</h3>
                <span className="text-gray-500">FREE</span>
              </div>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">Overall score (0-100)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">5 key issues with witty commentary</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">Severity ratings (Critical, Major, Minor)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">3 free roasts per hour</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg">
                Try Free Roast
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-brand-500">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Full Audit</h3>
                <span className="text-brand-600 font-bold">$9.99</span>
              </div>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">8-category detailed analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">Rewritten copy suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">Prioritized action items</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span className="text-gray-900">Downloadable PDF report</span>
                </li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={!url.trim()}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg"
              >
                Get Full Audit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: "How does the AI analyze my website?",
                a: "We use Claude AI to fetch and analyze your website content, evaluating design principles, copywriting effectiveness, user experience flow, SEO optimization, performance metrics, mobile responsiveness, trust signals, and conversion rate optimization techniques.",
              },
              {
                q: "What if my website requires authentication or blocks scrapers?",
                a: "We'll do our best to access your public-facing content. If your site blocks automated access, we may not be able to fully analyze it. For those cases, consider temporarily allowing access or upgrading to manually paste your content.",
              },
              {
                q: "How long does a full audit take?",
                a: "Our full audits typically complete within 30-60 seconds after purchase. You'll be redirected to a detailed results page with all analysis, suggestions, and action items.",
              },
              {
                q: "Can I download my audit results?",
                a: "Yes! With the full audit ($9.99), you get a downloadable text report containing all analysis, rewritten copy suggestions, and prioritized action items that you can reference and share with your team.",
              },
              {
                q: "Do you offer refunds?",
                a: "We stand behind our audits. If you're not satisfied, contact us within 24 hours for a full refund. No questions asked.",
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer"
                open={expandedFaq === idx}
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              >
                <summary className="font-semibold text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="ml-4 text-gray-400">
                    {expandedFaq === idx ? '−' : '+'}
                  </span>
                </summary>
                <p className="mt-3 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-gray-900">Velocity Forge AI</span>
              </div>
              <p className="text-gray-500 text-sm">Create Faster. Think Smarter. Scale Higher.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Tools</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Cover Letter AI
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Pitch Deck AI
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Content Calendar AI
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            <p>
              Built by <a href="https://gumroad.com/velocityforgeai" className="text-brand-600 hover:text-brand-700">Velocity Forge AI</a>
            </p>
            <p className="mt-2">© 2026 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
