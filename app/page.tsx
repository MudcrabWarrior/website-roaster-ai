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

    // Store URL in sessionStorage for the success page
    sessionStorage.setItem('auditUrl', url.trim())

    // Redirect to checkout
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

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'text-error'
      case 'major':
        return 'text-warning'
      case 'minor':
        return 'text-success'
      default:
        return 'text-text-secondary'
    }
  }

  const getSeverityBg = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-error bg-opacity-10'
      case 'major':
        return 'bg-warning bg-opacity-10'
      case 'minor':
        return 'bg-success bg-opacity-10'
      default:
        return 'bg-border bg-opacity-10'
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg bg-opacity-95 backdrop-blur-sm">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center font-bold text-white text-lg">
              🔥
            </div>
            <span className="font-bold text-lg hidden sm:inline">Velocity Forge</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-secondary hover:text-text transition-colors text-sm">
              Pitch Decks
            </a>
            <a href="#" className="text-text-secondary hover:text-text transition-colors text-sm">
              Cover Letters
            </a>
            <a href="#" className="text-text-secondary hover:text-text transition-colors text-sm">
              Content Calendar
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container px-4 py-20 sm:py-32 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-text animate-fade-up">
            Your Website, Roasted.
          </h1>
          <p className="text-xl text-text-secondary mb-12 animate-fade-up animate-stagger-100">
            Get brutally honest feedback on your website's design, copy, UX, and conversion potential. Free quick roast
            or paid full audit with detailed recommendations.
          </p>

          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto mb-12 animate-fade-up animate-stagger-200">
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleRoast()}
                className="flex-1 px-6 py-4 rounded-lg bg-surface border border-border focus:border-accent focus:bg-surface-hover focus:outline-none transition-all"
              />
              <button
                onClick={handleRoast}
                disabled={loading || !url.trim()}
                className="px-8 py-4 bg-accent hover:bg-accent-hover disabled:bg-border disabled:cursor-not-allowed font-semibold rounded-lg text-white transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin-slow w-5 h-5"
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
            <p className="text-sm text-text-secondary mt-3">
              {remaining > 0 ? `${remaining} free roasts remaining this hour` : 'Rate limit reached. Please try again later.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-error bg-opacity-10 border border-error text-error animate-fade-up">
              {error}
            </div>
          )}

          {/* Quick Roast Results */}
          {roastData && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
              {/* Score Badge */}
              <div className="inline-block animate-scale-in">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="var(--accent)"
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
                      fill="var(--text)"
                    >
                      {roastData.overallScore}
                    </text>
                    <text x="60" y="80" textAnchor="middle" fontSize="12" fill="var(--text-secondary)">
                      / 100
                    </text>
                  </svg>
                </div>
              </div>

              {/* Roast Summary */}
              <div className="card text-left">
                <h3 className="text-xl font-bold text-text mb-3">The Roast</h3>
                <p className="text-text-secondary italic">"{roastData.roastSummary}"</p>
              </div>

              {/* Issues Table */}
              <div className="card text-left overflow-x-auto">
                <h3 className="text-xl font-bold text-text mb-4">Key Issues Found</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-text-secondary font-semibold">Category</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-semibold">Issue</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-semibold">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roastData.issues.map((issue, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-surface-hover transition-colors">
                        <td className="py-3 px-4 text-text font-medium">{issue.category}</td>
                        <td className="py-3 px-4 text-text-secondary">{issue.issue}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBg(issue.severity)} ${getSeverityColor(issue.severity)}`}
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
              <div className="card bg-gradient-to-r from-accent from-10% to-accent-hover to-90% border-0 text-left">
                <h3 className="text-2xl font-bold text-white mb-3">Want the Full Audit?</h3>
                <p className="text-white text-opacity-90 mb-6">
                  Get detailed analysis across 8 categories, rewritten copy suggestions, and a prioritized action plan.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-accent font-bold rounded-lg transition-all"
                >
                  Upgrade to Full Audit - $9.99
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-20 bg-surface bg-opacity-50">
        <div className="container px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-accent bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Enter Your URL</h3>
              <p className="text-text-secondary">Paste your website URL and we'll fetch and analyze the content</p>
            </div>
            <div className="text-center animate-fade-up animate-stagger-100">
              <div className="w-16 h-16 rounded-full bg-accent bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
              <p className="text-text-secondary">Claude AI analyzes your site for design, copy, UX, and conversion issues</p>
            </div>
            <div className="text-center animate-fade-up animate-stagger-200">
              <div className="w-16 h-16 rounded-full bg-accent bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Get Results</h3>
              <p className="text-text-secondary">Receive actionable feedback with a score and specific recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs Pro Comparison */}
      <section className="border-t border-border py-20">
        <div className="container px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Free vs Pro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="card">
              <div className="flex items-baseline gap-2 mb-6">
                <h3 className="text-2xl font-bold">Quick Roast</h3>
                <span className="text-text-secondary">FREE</span>
              </div>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>Overall score (0-100)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>5 key issues with witty commentary</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>Severity ratings (Critical, Major, Minor)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>3 free roasts per hour</span>
                </li>
              </ul>
              <button className="w-full mt-8 px-6 py-3 bg-border hover:bg-surface-hover text-text font-semibold rounded-lg transition-all">
                Try Free Roast
              </button>
            </div>

            {/* Pro Tier */}
            <div className="card border-2 border-accent bg-gradient-to-br from-surface to-surface">
              <div className="flex items-baseline gap-2 mb-6">
                <h3 className="text-2xl font-bold">Full Audit</h3>
                <span className="text-accent font-bold">$9.99</span>
              </div>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>8-category detailed analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>Rewritten copy suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>Prioritized action items</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>Downloadable PDF report</span>
                </li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={!url.trim()}
                className="w-full mt-8 px-6 py-3 bg-accent hover:bg-accent-hover disabled:bg-border disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
              >
                Get Full Audit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border py-20 bg-surface bg-opacity-50">
        <div className="container px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>

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
              <div key={idx} className="card cursor-pointer hover:border-accent" onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}>
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-semibold text-lg text-text">{item.q}</h4>
                  <svg
                    className={`w-5 h-5 text-accent flex-shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                {expandedFaq === idx && <p className="mt-4 text-text-secondary">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface bg-opacity-50 py-12">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center font-bold text-white text-sm">
                  🔥
                </div>
                <span className="font-bold">Velocity Forge AI</span>
              </div>
              <p className="text-text-secondary text-sm">Create Faster. Think Smarter. Scale Higher.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Cover Letter AI
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Pitch Deck AI
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Content Calendar AI
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-text-secondary text-sm">
            <p>
              Built by <a href="https://gumroad.com/velocityforgeai" className="text-accent hover:text-accent-hover">Velocity Forge AI</a>
            </p>
            <p className="mt-2">© 2026 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
