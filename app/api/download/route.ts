import { NextRequest, NextResponse } from 'next/server'
import { FullAuditResponse } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audit, url } = body as { audit?: FullAuditResponse; url?: string }

    if (!audit || !url) {
      return NextResponse.json({ error: 'Missing audit data or URL' }, { status: 400 })
    }

    // Generate text content
    const textContent = generateTextReport(audit, url)

    return new NextResponse(textContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="website-audit-${Date.now()}.txt"`,
      },
    })
  } catch (error) {
    console.error('Error generating download:', error)
    return NextResponse.json({ error: 'Failed to generate download' }, { status: 500 })
  }
}

function generateTextReport(audit: FullAuditResponse, url: string): string {
  const lines: string[] = []

  lines.push('='.repeat(80))
  lines.push('WEBSITE ROASTER - FULL AUDIT REPORT')
  lines.push('='.repeat(80))
  lines.push(`\nWebsite: ${url}`)
  lines.push(`Generated: ${new Date().toLocaleString()}`)
  lines.push(`\nOVERALL SCORE: ${audit.overallScore}/100`)
  lines.push('\n' + '='.repeat(80))
  lines.push('EXECUTIVE SUMMARY')
  lines.push('='.repeat(80))
  lines.push(`\n${audit.summary}`)

  // Categories
  lines.push('\n' + '='.repeat(80))
  lines.push('DETAILED ANALYSIS BY CATEGORY')
  lines.push('='.repeat(80))

  for (const category of audit.categories) {
    lines.push(`\n${category.name.toUpperCase()} - Score: ${category.score}/100`)
    lines.push('-'.repeat(40))

    if (category.issues.length > 0) {
      lines.push('\nISSUES:')
      category.issues.forEach((issue, idx) => {
        lines.push(`  ${idx + 1}. ${issue}`)
      })
    }

    if (category.suggestions.length > 0) {
      lines.push('\nSUGGESTIONS:')
      category.suggestions.forEach((suggestion, idx) => {
        lines.push(`  ${idx + 1}. ${suggestion}`)
      })
    }
  }

  // Rewritten Copy
  if (audit.rewrittenCopy.length > 0) {
    lines.push('\n' + '='.repeat(80))
    lines.push('REWRITTEN COPY SUGGESTIONS')
    lines.push('='.repeat(80))

    for (const copy of audit.rewrittenCopy) {
      lines.push(`\n${copy.section.toUpperCase()}`)
      lines.push('-'.repeat(40))
      lines.push(`\nORIGINAL:\n${copy.original}`)
      lines.push(`\nREWRITTEN:\n${copy.rewritten}`)
      lines.push(`\nRATIONALE:\n${copy.rationale}`)
    }
  }

  // Action Items
  if (audit.actionItems.length > 0) {
    lines.push('\n' + '='.repeat(80))
    lines.push('PRIORITIZED ACTION ITEMS')
    lines.push('='.repeat(80))

    const p1Items = audit.actionItems.filter((item) => item.priority === 'P1')
    const p2Items = audit.actionItems.filter((item) => item.priority === 'P2')
    const p3Items = audit.actionItems.filter((item) => item.priority === 'P3')

    if (p1Items.length > 0) {
      lines.push('\nP1 - CRITICAL (Do First):')
      p1Items.forEach((item, idx) => {
        lines.push(`  ${idx + 1}. ${item.action}`)
        lines.push(`     Effort: ${item.effort} | Impact: ${item.impact}`)
      })
    }

    if (p2Items.length > 0) {
      lines.push('\nP2 - IMPORTANT (Do Next):')
      p2Items.forEach((item, idx) => {
        lines.push(`  ${idx + 1}. ${item.action}`)
        lines.push(`     Effort: ${item.effort} | Impact: ${item.impact}`)
      })
    }

    if (p3Items.length > 0) {
      lines.push('\nP3 - NICE TO HAVE (Do Later):')
      p3Items.forEach((item, idx) => {
        lines.push(`  ${idx + 1}. ${item.action}`)
        lines.push(`     Effort: ${item.effort} | Impact: ${item.impact}`)
      })
    }
  }

  lines.push('\n' + '='.repeat(80))
  lines.push('END OF REPORT')
  lines.push('='.repeat(80))

  return lines.join('\n')
}
