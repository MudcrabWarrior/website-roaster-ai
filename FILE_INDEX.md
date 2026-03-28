# Website Roaster AI - Complete File Index

## Project Root Files

### Configuration & Setup
- **package.json** - Node.js dependencies and scripts
  - Dependencies: react, next, stripe, @anthropic-ai/sdk, tailwindcss
  - Scripts: dev, build, start, lint

- **tsconfig.json** - TypeScript configuration
  - Strict mode enabled
  - Target ES2020
  - Path aliases configured

- **tailwind.config.ts** - Tailwind CSS configuration
  - Custom color themes using CSS variables
  - Custom animations (fade-up, scale-in, spin-slow)
  - Font family configuration

- **next.config.js** - Next.js configuration
  - TypeScript and ESLint strict checking
  - React strict mode enabled
  - Security headers configured

- **postcss.config.js** - PostCSS configuration
  - Tailwind CSS and Autoprefixer plugins

### Environment & Git
- **.env.local.example** - Environment variables template
  - Stripe keys (secret, public, webhook secret)
  - Anthropic API key
  - Base URL configuration

- **.gitignore** - Git ignore rules
  - node_modules, .next, .env files
  - IDE files, OS files

### Documentation
- **README.md** - Project overview and setup guide
  - Features overview
  - Tech stack
  - Installation instructions
  - Project structure
  - API documentation
  - Deployment instructions

- **QUICKSTART.md** - 5-minute quick start guide
  - Step-by-step setup
  - Testing instructions
  - Troubleshooting
  - Command reference

- **DEPLOYMENT.md** - Complete deployment guide
  - Pre-deployment checklist
  - Local testing procedures
  - Vercel deployment steps
  - Stripe webhook configuration
  - Post-deployment verification
  - Troubleshooting guide

- **DEVELOPMENT.md** - Development patterns and architecture
  - Project overview
  - Architecture description
  - Codebase structure
  - Development workflow
  - Common tasks
  - Error handling
  - Security considerations

- **PROJECT_SUMMARY.md** - Comprehensive project statistics
  - File manifest
  - Technology stack
  - Design system details
  - API endpoints
  - Data structures
  - Deployment checklist

## App Directory (`/app`)

### Pages

#### page.tsx (Landing & Free Tier - 800+ lines)
**Purpose:** Main landing page with free tier roast functionality

**Sections:**
1. **Sticky Navigation** - VF logo, links to other tools
2. **Hero Section** - "Your Website, Roasted" headline
3. **URL Input Form** - Website URL entry with validation
4. **Results Display** - Circular score gauge, issues table, severity badges
5. **Upgrade CTA** - Promotion for $9.99 full audit
6. **How It Works** - 3-step explanation
7. **Free vs Pro Comparison** - Feature comparison cards
8. **FAQ Accordion** - 5 SEO-optimized Q&A pairs
9. **Footer** - Branding and links to other tools

**Key Functions:**
- `handleRoast()` - Calls /api/generate and displays quick roast
- `handleUpgrade()` - Redirects to Stripe checkout
- `getSeverityColor()` - Returns color for severity level
- `getSeverityBg()` - Returns background color for severity badge

**State Management:**
- url - Current URL input value
- loading - Generation in progress
- roastData - Quick roast response
- error - Error message if any
- remaining - Remaining free roasts quota
- expandedFaq - Currently expanded FAQ item

#### success/page.tsx (Paid Tier Results - 500+ lines)
**Purpose:** Display full audit results after successful payment

**Sections:**
1. **Header** - URL display, download button
2. **Overall Score** - Large gradient badge with summary
3. **Category Grid** - 8 category cards (Copy, Design, UX, SEO, Performance, Mobile, Trust, Conversion)
4. **Rewritten Copy** - Before/after suggestions with rationale
5. **Action Items** - P1/P2/P3 prioritized list with effort/impact
6. **Download CTA** - Button to download text report
7. **Footer** - Contact information

**Key Functions:**
- `stripHtmlTags()` - HTML content cleaning
- `generateAudit()` - Fetches page content and calls Claude
- `handleDownload()` - Downloads audit report as text file

**State Management:**
- audit - Full audit data
- loading - Generation in progress
- error - Error message if any
- url - Website URL being audited
- pageContent - Extracted website content

#### layout.tsx (Root Layout)
**Purpose:** Root layout with metadata and global styles

**Content:**
- HTML metadata (charset, theme color)
- Favicon configuration
- Font imports
- Global styles import
- SEO metadata

**Metadata Includes:**
- Title, description, keywords
- Open Graph tags
- Twitter card tags
- Viewport configuration
- Robots directives

### API Routes

#### api/generate/route.ts (Free Tier API)
**Method:** POST
**Purpose:** Generate quick roast for free tier

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "roast": {
    "overallScore": 65,
    "roastSummary": "...",
    "issues": [...]
  },
  "remaining": 2
}
```

**Process:**
1. Extract client IP from x-forwarded-for header
2. Check rate limit (3 per hour)
3. Normalize and fetch website URL
4. Strip HTML tags and limit to 5000 chars
5. Send to Claude with roast prompt
6. Parse JSON response
7. Return roast + remaining quota

**Error Handling:**
- Invalid URL
- Network timeout
- Content extraction failure
- Claude API error
- Rate limit exceeded

#### api/checkout/route.ts (Stripe Checkout)
**Method:** POST
**Purpose:** Create Stripe checkout session for $9.99 full audit

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

**Process:**
1. Validate URL input
2. Build success URL with session_id parameter
3. Create Stripe checkout session
4. Store URL in session metadata
5. Return checkout URL

**Error Handling:**
- Missing URL
- Invalid URL
- Stripe API error

#### api/webhook/route.ts (Stripe Webhook Handler)
**Method:** POST
**Purpose:** Handle Stripe webhook events

**Events Handled:**
- `checkout.session.completed` - Successful payment

**Process:**
1. Extract signature from headers
2. Verify webhook signature
3. Parse event data
4. Log session completion
5. Return success

**In Production Could:**
- Store session data in database
- Send confirmation email
- Update user account
- Trigger delivery of results

#### api/download/route.ts (Download Report)
**Method:** POST
**Purpose:** Generate and download audit report as text file

**Request:**
```json
{
  "audit": {...},
  "url": "https://example.com"
}
```

**Response:**
- Content-Type: text/plain
- Content-Disposition: attachment
- Filename: website-audit-[timestamp].txt

**Report Format:**
- Header with URL and timestamp
- Overall score
- Executive summary
- Category breakdown (with issues and suggestions)
- Rewritten copy examples
- Prioritized action items (P1/P2/P3)
- Footer

### Styling

#### globals.css (Design System - 400+ lines)
**Purpose:** Global styles, design tokens, and animations

**Sections:**
1. **Font Imports** - Inter and JetBrains Mono from Google Fonts
2. **CSS Variables** - Design tokens (colors, spacing)
3. **Base Styles** - HTML, body, typography defaults
4. **Typography** - Heading and paragraph styles
5. **Links & Buttons** - Base element styles
6. **Scrollbar** - Custom scrollbar styling
7. **Animations** - Keyframes and utility classes
8. **Components** - Button, card, badge, input styles
9. **Layout** - Grid and container utilities
10. **Utilities** - Spacing, text, opacity classes
11. **Messages** - Success, error, warning styles

**Design Tokens:**
- Colors: bg, surface, border, text, accent, error, success, warning
- Fonts: Inter (UI), JetBrains Mono (code)
- Animations: fade-up, fade-in, scale-in, spin-slow, pulse-ring

### Meta Files

#### robots.ts (SEO Robots Configuration)
**Purpose:** Configure search engine crawling rules

**Configuration:**
- Allow all URLs except /api/ and /success/
- Sitemap URL specified

#### sitemap.ts (SEO Sitemap)
**Purpose:** Provide sitemap for search engines

**URLs:**
- Homepage (priority 1.0)
- Success page (priority 0.5)

## Lib Directory (`/lib`)

### stripe.ts (Stripe Integration - Lazy Initialization)
**Exports:**
- `getStripe()` - Lazy-initialized Stripe client
- `createCheckoutSession(url, returnUrl)` - Create $9.99 checkout
- `verifyWebhookSignature(body, signature)` - Verify webhook

**Features:**
- Lazy initialization (client created on first use)
- API version: 2026-03-25.dahlia
- Automatic error handling
- Type-safe responses

### anthropic.ts (Claude Integration - Lazy Initialization)
**Exports:**
- `getAnthropic()` - Lazy-initialized Anthropic client
- `generateQuickRoast(pageContent)` - Free tier roast
- `generateFullAudit(pageContent, url)` - Paid tier audit
- TypeScript interfaces for responses

**Features:**
- Lazy initialization (client created on first use)
- Model: claude-haiku-4-5-20251001
- JSON response parsing with validation
- Structured prompts with JSON schema
- Error handling and recovery

**Interfaces:**
```typescript
QuickRoastResponse {
  overallScore: number
  roastSummary: string
  issues: Array<{category, issue, roast, severity}>
}

FullAuditResponse {
  overallScore: number
  summary: string
  categories: Array<{name, score, issues, suggestions}>
  rewrittenCopy: Array<{section, original, rewritten, rationale}>
  actionItems: Array<{priority, action, effort, impact}>
}
```

### rate-limit.ts (IP-Based Rate Limiting)
**Exports:**
- `checkRateLimit(ip)` - Returns true if within quota
- `getRemainingQuota(ip)` - Returns remaining requests
- `getResetTime(ip)` - Returns when quota resets

**Features:**
- In-memory Map storage
- 3 requests per hour per IP
- Automatic window reset
- Zero external dependencies

**Implementation:**
- Tracks count and resetTime per IP
- Auto-resets when time window expires
- No database required

## Summary Statistics

### Code Organization
- **Pages:** 2 (landing, success)
- **API Routes:** 4 (generate, checkout, webhook, download)
- **Library Files:** 3 (stripe, anthropic, rate-limit)
- **Styling:** 1 global CSS file (~400 lines)
- **Configuration:** 5 files (TypeScript, Tailwind, Next, PostCSS, package)

### Code Metrics
- **Total TypeScript/TSX:** ~1,974 lines
- **API Code:** ~450 lines
- **Page Code:** ~1,300 lines
- **Library Code:** ~200 lines
- **CSS:** ~400 lines
- **Documentation:** ~2,000 lines

### Dependencies
- **Runtime:** react, react-dom, next, stripe, @anthropic-ai/sdk, tailwindcss
- **Dev:** typescript, @types/*, autoprefixer, postcss

## File Dependencies Graph

```
page.tsx
├── /api/generate (fetch)
├── /api/checkout (fetch)
├── globals.css
└── lib/anthropic.ts (types)

success/page.tsx
├── lib/anthropic.ts (generateFullAudit)
├── /api/download (fetch)
└── globals.css

api/generate/route.ts
├── lib/anthropic.ts (generateQuickRoast)
└── lib/rate-limit.ts (checkRateLimit)

api/checkout/route.ts
└── lib/stripe.ts (createCheckoutSession)

api/webhook/route.ts
└── lib/stripe.ts (verifyWebhookSignature)

api/download/route.ts
└── lib/anthropic.ts (FullAuditResponse type)

lib/anthropic.ts
└── @anthropic-ai/sdk (Anthropic client)

lib/stripe.ts
└── stripe (Stripe client)

layout.tsx
└── globals.css

globals.css
└── Google Fonts (Inter, JetBrains Mono)
```

## Quick Navigation

### To Modify Landing Page Design
- Edit: `app/page.tsx`
- Styles: `app/globals.css`
- Colors/tokens: See :root in globals.css

### To Change Free Tier Roast Logic
- Edit: `lib/anthropic.ts` (generateQuickRoast function)
- Test: `app/api/generate/route.ts`

### To Change Paid Tier Analysis
- Edit: `lib/anthropic.ts` (generateFullAudit function)
- Test: `app/success/page.tsx`

### To Adjust Rate Limiting
- Edit: `lib/rate-limit.ts` (LIMIT and WINDOW constants)
- Verify: `app/api/generate/route.ts`

### To Change Stripe Integration
- Edit: `lib/stripe.ts`
- Reference: `app/api/checkout/route.ts`

### To Update Documentation
- Edit any .md file in project root
- Keep in sync with actual implementation

---

**Total Files:** 23
**Total Lines:** ~5,000+ (code + docs)
**Status:** Production Ready
