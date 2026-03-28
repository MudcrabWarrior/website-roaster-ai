import Anthropic from '@anthropic-ai/sdk'

let anthropicInstance: Anthropic | null = null

export function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not defined')
    }
    anthropicInstance = new Anthropic({ apiKey })
  }
  return anthropicInstance
}

export interface QuickRoastResponse {
  overallScore: number
  roastSummary: string
  issues: Array<{
    category: string
    issue: string
    roast: string
    severity: 'critical' | 'major' | 'minor'
  }>
}

export interface FullAuditResponse {
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

export async function generateQuickRoast(pageContent: string): Promise<QuickRoastResponse> {
  const anthropic = getAnthropic()

  const prompt = `You are a brutally honest but constructive website roaster. Analyze the following website content and provide a quick roast.

Be witty, slightly sarcastic (think Gordon Ramsay meets web design), and focus on real, actionable issues. Score fairly - most sites should score 40-70.

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "roastSummary": "<2-3 sentence witty summary>",
  "issues": [
    {
      "category": "<string>",
      "issue": "<string>",
      "roast": "<witty commentary>",
      "severity": "<critical|major|minor>"
    }
  ]
}

Return exactly 5 issues. Make sure the JSON is valid.

Website content:
${pageContent}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    const parsed = JSON.parse(jsonMatch[0]) as QuickRoastResponse
    return parsed
  } catch (error) {
    console.error('Failed to parse Claude response:', content.text)
    throw new Error('Failed to parse roast response')
  }
}

export async function generateFullAudit(pageContent: string, url: string): Promise<FullAuditResponse> {
  const anthropic = getAnthropic()

  const prompt = `You are an expert web auditor providing comprehensive website analysis. Analyze the following website and provide a detailed full audit.

Website URL: ${url}
Website content:
${pageContent}

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "categories": [
    {
      "name": "<category name>",
      "score": <number 0-100>,
      "issues": ["<issue1>", "<issue2>"],
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    }
  ],
  "rewrittenCopy": [
    {
      "section": "<section name>",
      "original": "<original text>",
      "rewritten": "<improved text>",
      "rationale": "<why this is better>"
    }
  ],
  "actionItems": [
    {
      "priority": "<P1|P2|P3>",
      "action": "<specific action>",
      "effort": "<Quick|Medium|Heavy>",
      "impact": "<High|Medium|Low>"
    }
  ]
}

Analyze these 8 categories:
1. Copy - Headline, tagline, value proposition clarity
2. Design - Visual hierarchy, spacing, typography, color usage
3. UX - Navigation clarity, CTA placement, form usability
4. SEO - Meta tags, headings structure, keyword relevance
5. Performance - Load speed indicators, mobile optimization
6. Mobile - Responsive design, touch targets, mobile UX
7. Trust/Credibility - Social proof, testimonials, credentials, security signals
8. Conversion - CTA clarity, call-to-action buttons, form optimization

For rewrittenCopy, provide 2-3 examples of improved copy.
For actionItems, provide 5-7 prioritized actions.

Make sure the JSON is valid.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    const parsed = JSON.parse(jsonMatch[0]) as FullAuditResponse
    return parsed
  } catch (error) {
    console.error('Failed to parse Claude response:', content.text)
    throw new Error('Failed to parse audit response')
  }
}
