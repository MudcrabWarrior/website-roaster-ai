import { NextRequest, NextResponse } from 'next/server'
import { generateFullAudit } from '@/lib/anthropic'
import { validateUrl } from '@/lib/url-validator'

function stripHtmlTags(html: string): string {
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  text = text.replace(/<[^>]+>/g, '')
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, sessionId } = body as { url?: string; sessionId?: string }

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // SSRF protection: validate URL before fetching
    const validation = validateUrl(url)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid URL' },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(validation.url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
      redirect: 'manual',
    })

    clearTimeout(timeoutId)

    // Validate redirect targets
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (location) {
        const redirectCheck = validateUrl(location)
        if (!redirectCheck.valid) {
          return NextResponse.json(
            { error: 'Redirect target is not allowed.' },
            { status: 400 }
          )
        }
      }
      return NextResponse.json(
        { error: 'Could not follow redirect. Please try the final URL directly.' },
        { status: 400 }
      )
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status}`)
    }

    const html = await response.text()
    const textContent = stripHtmlTags(html).substring(0, 8000)

    const audit = await generateFullAudit(textContent, url)

    return NextResponse.json(audit)
  } catch (error) {
    console.error('Error generating audit:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate audit'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
