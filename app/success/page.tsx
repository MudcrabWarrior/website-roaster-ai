'use client'

import { useEffect, useState } from 'react'

interface FullAuditResponse {
  overallScore: number
  summary: string
  categories: Array<{
    name: string
    score: number
    issues: string[]
    suggestions: string[]
  }>
  rewrittenCopy: Array<{
    section: string
    original: string
    rewritten: string
    rationale: string
  }>
  actionItems: Array<{
    priority: 'P1' | 'P2' | 'P3'
    action: string
    effort: 'Quick' | 'Medium' | 'Heavy'
    impact: 'High' | 'Medium' | 'Low'
  }>
}

export default function SuccessPage() {
  const [audit, setAudit] = useState<FullAuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const generateAudit = async () => {
      try {
        const storedUrl = sessionStorage.getItem('auditUrl')
        if (!storedUrl) {
          setError('No URL found. Please start over.')
          setLoading(false)
          return
        }

        setUrl(storedUrl)

        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('session_id')

        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: storedUrl, sessionId }),
        })

        const data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }

        setAudit(data)
      } catch (err) {
        console.error('Error generating audit:', err)
        setError('Failed to generate audit. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    generateAudit()
  }, [])

  const handleDownload = async () => {
    if (!audit) return

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audit, url }),
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `website-audit-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <svg className="animate-spin-slow w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path stroke="currentColor" strokeWidth="2" d="M12 2a10 10 0 0 1 0 20" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mt-6 mb-2">Generating Your Full Audit</h2>
          <p className="text-text-secondary">This may take a moment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="container px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-lg bg-error bg-opacity-10 border border-error text-error mb-8">
              {error}
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-all"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No audit data found</h2>
          <a href="/" className="text-accent hover:text-accent-hover">
            Return home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-border bg-surface bg-opacity-50 sticky top-0 z-40">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Full Website Audit</h1>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-all"
            >
              Download Report
            </button>
          </div>
          <p className="text-text-secondary text-sm">{url}</p>
        </div>
      </div>

      <div className="container px-4 py-12">
        {/* Overall Score */}
        <div className="max-w-2xl mx-auto mb-16 animate-fade-up">
          <div className="card bg-gradient-to-r from-accent from-10% to-accent-hover to-90% border-0 text-white p-8">
            <h2 className="text-sm font-semibold opacity-90 mb-2">OVERALL SCORE</h2>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-6xl font-bold">{audit.overallScore}</span>
              <span className="text-2xl opacity-75">/ 100</span>
            </div>
            <p className="text-lg opacity-90">{audit.summary}</p>
          </div>
        </div>

        {/* Category Grid */}
        <div className="mb-16 animate-fade-up animate-stagger-100">
          <h2 className="text-3xl font-bold mb-8">Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audit.categories.map((category, idx) => (
              <div key={idx} className="card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-text">{category.name}</h3>
                  <span className="text-3xl font-bold text-accent">{category.score}</span>
                </div>

                {category.issues.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Issues:</h4>
                    <ul className="space-y-2">
                      {category.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-text-secondary flex gap-2">
                          <span className="text-error">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {category.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Suggestions:</h4>
                    <ul className="space-y-2">
                      {category.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-text-secondary flex gap-2">
                          <span className="text-success">✓</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rewritten Copy */}
        {audit.rewrittenCopy.length > 0 && (
          <div className="mb-16 animate-fade-up animate-stagger-200">
            <h2 className="text-3xl font-bold mb-8">Rewritten Copy Suggestions</h2>
            <div className="space-y-6">
              {audit.rewrittenCopy.map((copy, idx) => (
                <div key={idx} className="card">
                  <h3 className="text-lg font-bold text-text mb-4">{copy.section}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-text-secondary mb-2">Original</h4>
                      <div className="p-4 rounded-lg bg-surface-hover border border-error border-opacity-30">
                        <p className="text-text-secondary text-sm">{copy.original}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-text-secondary mb-2">Rewritten</h4>
                      <div className="p-4 rounded-lg bg-surface-hover border border-success border-opacity-30">
                        <p className="text-text text-sm font-medium">{copy.rewritten}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-accent-subtle border border-accent border-opacity-30">
                    <p className="text-sm text-accent">
                      <span className="font-semibold">Why:</span> {copy.rationale}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {audit.actionItems.length > 0 && (
          <div className="max-w-3xl mx-auto animate-fade-up animate-stagger-300">
            <h2 className="text-3xl font-bold mb-8">Prioritized Action Items</h2>

            {audit.actionItems.filter((item) => item.priority === 'P1').length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-error mb-4">P1 - Critical (Do First)</h3>
                <div className="space-y-3">
                  {audit.actionItems
                    .filter((item) => item.priority === 'P1')
                    .map((item, idx) => (
                      <div key={idx} className="card border-error border-opacity-30 bg-error bg-opacity-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold text-text">{item.action}</h4>
                          <span className="badge badge-error whitespace-nowrap">{item.priority}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-text-secondary">
                          <span>Effort: {item.effort}</span>
                          <span>Impact: {item.impact}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {audit.actionItems.filter((item) => item.priority === 'P2').length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-warning mb-4">P2 - Important (Do Next)</h3>
                <div className="space-y-3">
                  {audit.actionItems
                    .filter((item) => item.priority === 'P2')
                    .map((item, idx) => (
                      <div key={idx} className="card border-warning border-opacity-30 bg-warning bg-opacity-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold text-text">{item.action}</h4>
                          <span className="badge badge-warning whitespace-nowrap">{item.priority}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-text-secondary">
                          <span>Effort: {item.effort}</span>
                          <span>Impact: {item.impact}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {audit.actionItems.filter((item) => item.priority === 'P3').length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-success mb-4">P3 - Nice to Have (Do Later)</h3>
                <div className="space-y-3">
                  {audit.actionItems
                    .filter((item) => item.priority === 'P3')
                    .map((item, idx) => (
                      <div key={idx} className="card border-success border-opacity-30 bg-success bg-opacity-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold text-text">{item.action}</h4>
                          <span className="badge badge-success whitespace-nowrap">{item.priority}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-text-secondary">
                          <span>Effort: {item.effort}</span>
                          <span>Impact: {item.impact}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16 text-center animate-fade-up animate-stagger-400">
          <div className="p-8 rounded-lg bg-surface border border-border">
            <h3 className="text-2xl font-bold mb-3">Ready to Implement?</h3>
            <p className="text-text-secondary mb-6">Download your full report and start making improvements today.</p>
            <button
              onClick={handleDownload}
              className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-all"
            >
              Download Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-surface bg-opacity-50 py-12 mt-16">
        <div className="container px-4 text-center text-text-secondary text-sm">
          <p>
            Need help? Contact{' '}
            <a href="mailto:mudcrabwarrior@gmail.com" className="text-accent hover:text-accent-hover">
              mudcrabwarrior@gmail.com
            </a>
          </p>
          <p className="mt-4">© 2026 Velocity Forge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
