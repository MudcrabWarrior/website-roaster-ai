# Website Roaster AI

An AI-powered website audit and review tool that provides brutally honest feedback on design, copy, UX, SEO, and conversion optimization.

## Features

### Free Tier - Quick Roast
- Overall website score (0-100)
- 5 key issues with witty commentary
- Severity ratings (Critical, Major, Minor)
- 3 free roasts per hour per IP

### Paid Tier - Full Audit ($9.99)
- 8-category detailed analysis (Copy, Design, UX, SEO, Performance, Mobile, Trust/Credibility, Conversion)
- Detailed scoring for each category
- Rewritten copy suggestions with rationale
- Prioritized action items (P1, P2, P3) with effort and impact estimates
- Downloadable text report

## Tech Stack

- **Frontend:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS with CSS custom properties
- **AI:** Claude Haiku 4.5 (claude-haiku-4-5-20251001)
- **Payments:** Stripe Checkout (session-based)
- **Hosting:** Vercel
- **Rate Limiting:** IP-based in-memory Map (3 free roasts/hour)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Stripe account (for payments)
- Anthropic API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ANTHROPIC_API_KEY=sk-ant-...
   NEXT_PUBLIC_BASE_URL=https://website-roaster-ai.vercel.app
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx                 # Landing page with URL input and quick roast
├── layout.tsx              # Root layout with metadata
├── globals.css             # Design tokens and base styles
├── robots.ts               # SEO robots configuration
├── sitemap.ts              # SEO sitemap
├── api/
│   ├── generate/route.ts   # Free tier roast generation
│   ├── checkout/route.ts   # Stripe checkout session creation
│   ├── webhook/route.ts    # Stripe webhook handler
│   └── download/route.ts   # PDF report download
└── success/
    └── page.tsx            # Full audit results page

lib/
├── stripe.ts               # Stripe initialization and utilities
├── anthropic.ts            # Claude API integration
└── rate-limit.ts           # IP-based rate limiting
```

## Design System

The app uses a dark zinc/purple theme with:
- CSS custom properties for colors
- Inter font for UI, JetBrains Mono for code
- Smooth animations and transitions
- Responsive grid layouts
- SVG icons throughout

## API Endpoints

### POST /api/generate
Free tier roast generation.

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

### POST /api/checkout
Create Stripe checkout session.

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

### POST /api/webhook
Stripe webhook handler for payment confirmations.

### POST /api/download
Download audit report as text file.

**Request:**
```json
{
  "audit": {...},
  "url": "https://example.com"
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables
All environment variables from `.env.local.example` must be set in your hosting provider.

## Rate Limiting

The free tier is rate-limited to 3 roasts per hour per IP address using the `x-forwarded-for` header.

## Pricing

- **Free Tier:** Quick Roast (no payment required)
- **Paid Tier:** Full Audit - $9.99 (one-time payment via Stripe)

## Contributing

This is a Velocity Forge AI production tool. For issues or feature requests, contact mudcrabwarrior@gmail.com.

## License

© 2026 Velocity Forge AI. All rights reserved.
