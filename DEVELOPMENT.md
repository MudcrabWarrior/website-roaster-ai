# Development Guide - Website Roaster AI

## Project Overview

Website Roaster AI is a Next.js 14 SaaS tool that provides AI-powered website audits. It's Tool #4 in the Velocity Forge AI fleet and uses the same design system and architecture as the other tools (Cover Letter AI, Pitch Deck AI, Content Calendar AI).

## Architecture

### Tech Stack
- **Framework:** Next.js 14 with App Router (no /src directory)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS custom properties
- **AI:** Anthropic Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- **Payments:** Stripe Checkout (session-based, not subscriptions)
- **Rate Limiting:** In-memory IP-based Map
- **Hosting:** Vercel (serverless)

### Key Features
1. **Free Tier (Quick Roast)**
   - Overall score (0-100)
   - 5 key issues with severity ratings
   - Witty, Gordon Ramsay-style commentary
   - 3 requests per hour per IP

2. **Paid Tier ($9.99 Full Audit)**
   - 8-category detailed analysis
   - Rewritten copy suggestions
   - Prioritized action items
   - Downloadable text report

## Codebase Structure

### App Routes

#### `app/page.tsx` (Landing & Free Tier)
- Single "use client" component (~800 lines)
- Contains:
  - Sticky navigation with VF branding
  - Hero section with value prop
  - URL input form
  - Free roast results display
  - "How it Works" section
  - Free vs Pro comparison cards
  - FAQ accordion
  - Footer with links to other tools

**Key Functions:**
- `handleRoast()` - Calls `/api/generate` and displays quick roast
- `handleUpgrade()` - Redirects to Stripe checkout
- `getSeverityColor()` / `getSeverityBg()` - Styling helpers

#### `app/success/page.tsx` (Paid Tier Results)
- Receives `session_id` from Stripe checkout
- Retrieves URL from `sessionStorage`
- Calls Claude to generate full audit
- Displays 8-category breakdown
- Shows rewritten copy suggestions
- Lists prioritized action items
- Provides download button

**Key Features:**
- Loading state with spinner
- Error handling
- Beautiful circular score display
- Category cards with issues & suggestions
- Before/after copy comparison
- Download as text file

#### `app/layout.tsx`
- Root layout with metadata
- Sets up HTML head (fonts, theme color, favicon)
- Includes `globals.css`

### API Routes

#### `app/api/generate/route.ts` (Free Tier Generation)
**Purpose:** Generate quick roast for free tier

**Steps:**
1. Check rate limit (3 per hour per IP)
2. Fetch website content via HTTP GET
3. Strip HTML tags and limit to 5000 chars
4. Send to Claude with roast prompt
5. Parse JSON response
6. Return roast + remaining quota

**Prompt:** Instructs Claude to be witty, Gordon Ramsay-style, and return 5 issues with severity

#### `app/api/checkout/route.ts`
**Purpose:** Create Stripe checkout session

**Steps:**
1. Accept URL from request
2. Store URL in Stripe session metadata
3. Create checkout session ($9.99)
4. Return checkout URL

#### `app/api/webhook/route.ts`
**Purpose:** Handle Stripe webhook for payment confirmations

**Events Handled:**
- `checkout.session.completed` - Logs successful payment

**Note:** Currently just logs; in production, could:
- Store session data in database
- Send confirmation email
- Update user account with premium status

#### `app/api/download/route.ts`
**Purpose:** Generate and download audit report as text

**Features:**
- Formats audit data as readable text report
- Groups action items by priority (P1, P2, P3)
- Returns as downloadable attachment

### Library Code

#### `lib/stripe.ts`
**Exports:**
- `getStripe()` - Lazy-initialized Stripe client
- `createCheckoutSession(url, returnUrl)` - Creates checkout session
- `verifyWebhookSignature(body, signature)` - Verifies Stripe webhook

**Key Detail:** Uses Stripe API version `2026-03-25.dahlia`

#### `lib/anthropic.ts`
**Exports:**
- `getAnthropic()` - Lazy-initialized Anthropic client
- `generateQuickRoast(pageContent)` - Free tier roast
- `generateFullAudit(pageContent, url)` - Paid tier audit
- TypeScript interfaces: `QuickRoastResponse`, `FullAuditResponse`

**Models:**
- Uses `claude-haiku-4-5-20251001` (most cost-effective)
- Quick roast: max_tokens 1024
- Full audit: max_tokens 2048

**Prompting Strategy:**
- Both prompts instruct Claude to return valid JSON only
- Roast prompt emphasizes wit and actionability
- Audit prompt specifies 8 categories and detailed structure
- Responses are parsed and validated before returning

#### `lib/rate-limit.ts`
**Exports:**
- `checkRateLimit(ip)` - Returns true if within limit
- `getRemainingQuota(ip)` - Returns remaining requests
- `getResetTime(ip)` - Returns when rate limit resets

**Implementation:**
- In-memory Map with IP as key
- Tracks count and resetTime per IP
- 3 requests per 1 hour per IP
- Auto-resets when window expires

### Styling

#### `app/globals.css`
**Contains:**
- CSS custom properties for design tokens (dark zinc/purple theme)
- Base styles (typography, forms, buttons, cards)
- Animation keyframes (fade-up, fade-in, slide-in, scale-in, spin-slow, pulse-ring)
- Utility classes (badges, badges, dividers, messages)
- Responsive breakpoints via media queries

**Design System:**
```css
--bg: #09090b;              /* Dark background */
--surface: #18181b;         /* Card background */
--border: #3f3f46;          /* Border color */
--text: #fafafa;            /* Primary text */
--text-secondary: #a1a1aa;  /* Secondary text */
--accent: #6d28d9;          /* Purple accent */
--error: #ef4444;           /* Red for errors */
--success: #22c55e;         /* Green for success */
--warning: #f59e0b;         /* Amber for warnings */
```

#### `tailwind.config.ts`
- Extends Tailwind with custom colors using CSS variables
- Adds custom keyframes and animations
- Configures font families (Inter, JetBrains Mono)

## Development Workflow

### Adding a New Feature

1. **Plan the component** - Sketch on paper or Figma
2. **Add styles** - Add to `globals.css` if needed
3. **Build the component** - In the appropriate .tsx file
4. **Test locally** - `npm run dev`
5. **Commit** - `git add . && git commit -m "Feature description"`

### Modifying the Roast Prompt

1. Edit the prompt in `lib/anthropic.ts`
2. Test with a sample website
3. Adjust until response quality is good
4. Commit changes

### Adding a New Rate Limit Tier

1. Modify `lib/rate-limit.ts` constants:
   ```typescript
   const LIMIT = 3     // Change this
   const WINDOW = ...  // Change this
   ```
2. Test rate limiting with repeated requests
3. Verify reset logic

### Deploying Changes

1. `git add .`
2. `git commit -m "Description of changes"`
3. `git push origin main`
4. Vercel auto-deploys on main push
5. Check Vercel dashboard for build status

## Common Tasks

### Testing the Free Tier Locally

```typescript
// In browser console, or via curl:
fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
})
  .then(r => r.json())
  .then(data => console.log(data))
```

### Testing the Paid Tier Locally

1. Set Stripe keys to **test** mode
2. Use test card: `4242 4242 4242 4242`
3. Click "Get Full Audit"
4. Complete checkout
5. Inspect success page

### Testing Rate Limiting

```typescript
// Simulate multiple requests from same IP
for (let i = 0; i < 5; i++) {
  fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  })
    .then(r => r.json())
    .then(data => console.log(`Request ${i+1}:`, data.error || 'Success'))
}
```

### Checking Build Size

```bash
npm run build
# Check output size in .next/static
```

### TypeScript Checking

```bash
npx tsc --noEmit
```

## Performance Considerations

### API Costs
- **Quick Roast:** ~$0.003 per generation (Haiku + input tokens)
- **Full Audit:** ~$0.01 per generation (Haiku + input tokens)
- **Breakeven:** ~1-2 paid users/day covers API costs

### Response Times
- URL fetch: 1-3 seconds
- Claude generation: 2-5 seconds
- Total: 3-8 seconds per request (acceptable)

### Optimization Opportunities
1. Add caching for repeated URLs (Redis)
2. Pre-generate prompts (save tokens)
3. Use streaming for long responses
4. Add request deduplication

## Security Considerations

1. **Stripe Webhook Verification** - Always verify signature
2. **Rate Limiting** - Prevents abuse (3/hour per IP)
3. **Input Validation** - URL must be valid HTTP(S)
4. **Environment Variables** - Never commit secrets
5. **API Keys** - Stripe and Anthropic keys in env, never in code

## Error Handling

### Common Error Scenarios

1. **Invalid URL** - `Failed to fetch website`
2. **Site Blocks Scraping** - `Could not extract content from website`
3. **Rate Limit Exceeded** - `Rate limit exceeded. You have 3 free roasts per hour.`
4. **Claude API Error** - `Failed to parse roast response`
5. **Stripe Error** - `Failed to create checkout session`

### Error Recovery
- All errors display user-friendly messages
- API returns 4xx/5xx status codes
- Frontend shows error state without crashing

## Testing Checklist

- [ ] Free tier generates quick roasts
- [ ] Roast includes 5 issues with severity ratings
- [ ] Rate limiting allows 3 requests per hour
- [ ] 4th request within hour is blocked
- [ ] Paid tier redirects to Stripe checkout
- [ ] Checkout with test card completes
- [ ] Success page generates full audit
- [ ] Full audit shows 8 categories with scores
- [ ] Rewritten copy suggestions display correctly
- [ ] Action items are prioritized
- [ ] Download button generates text file
- [ ] All links navigate correctly
- [ ] Mobile responsive design works
- [ ] Dark theme displays correctly

## Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Stripe API Docs](https://stripe.com/docs)

## Support

For questions or issues:
- Check the README.md
- Review DEPLOYMENT.md for setup issues
- Contact: mudcrabwarrior@gmail.com
