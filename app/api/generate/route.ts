import { NextRequest, NextResponse } from 'next/server'
import { generateQuickRoast } from '@/lib/anthropic'
import { checkRateLimit, getRemainingQuota } from '@/lib/rate-limit'

async function fetchPageContent(url: string): Promise<string> {
  try {
    // Normalize URL
    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const textContent = stripHtmlTags(html)
    const limitedContent = textContent.substring(0, 5000)

    return limitedContent
  } catch (error) {
    console.error('Error fetching page:', error)
    throw new Error('Failed to fetch website. Make sure the URL is correct and the site is accessible.')
  }
}

function stripHtmlTags(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.ip || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      const remaining = getRemainingQuota(clientIp)
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You have 3 free roasts per hour.',
          remaining: remaining,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { url } = body as { url?: string }

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch and process the page
    const pageContent = await fetchPageContent(url)

    if (!pageContent || pageContent.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract content from the website. The site may block automated access.' },
        { status: 400 }
      )
    }

    // Generate quick roast
    const roast = await generateQuickRoast(pageContent)

    const remaining = getRemainingQuota(clientIp)

    return NextResponse.json({
      success: true,
      roast: roast,
      remaining: remaining,
    })
  } catch (error) {
    console.error('Error generating roast:', error)

    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating the roast'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
