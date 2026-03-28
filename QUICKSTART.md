# Quick Start Guide - Website Roaster AI

Get the Website Roaster tool running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Stripe account (free)
- Anthropic API key

## Setup Steps

### 1. Install Dependencies (1 min)
```bash
cd website-roaster-ai
npm install
```

### 2. Configure Environment Variables (2 min)

Create `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:
- Your Stripe test secret key (get from Stripe Dashboard > Developers > API Keys)
- Your Anthropic API key (get from console.anthropic.com)
- Leave `STRIPE_WEBHOOK_SECRET` empty for local development
- Set `NEXT_PUBLIC_BASE_URL=http://localhost:3000`

### 3. Start Development Server (1 min)
```bash
npm run dev
```

The app will be available at http://localhost:3000

### 4. Test Free Tier (1 min)
1. Navigate to http://localhost:3000
2. Enter a website URL (e.g., `https://example.com`)
3. Click "Roast My Website"
4. Watch as the AI generates a quick roast

## Testing Stripe Checkout (Optional)

If you want to test the paid tier:

1. Set Stripe keys to **test mode** values in `.env.local`
2. Enter a website URL and click "Get Full Audit"
3. You'll be redirected to Stripe checkout
4. Use test card: **4242 4242 4242 4242** (any future expiry, any CVC)
5. After successful payment, you'll see the full audit results

## What to Test

### Free Tier
- [ ] Landing page loads with dark theme
- [ ] URL input accepts valid URLs
- [ ] Quick roast generates in 3-8 seconds
- [ ] Results show score, issues, and roast commentary
- [ ] Upgrade button appears with pricing
- [ ] Making 4 requests within an hour shows rate limit message
- [ ] FAQ accordion opens/closes
- [ ] Navigation links work

### Paid Tier (if testing with Stripe test card)
- [ ] Checkout button redirects to Stripe
- [ ] Payment flow completes successfully
- [ ] Success page generates full audit
- [ ] 8 categories display with scores
- [ ] Rewritten copy suggestions appear
- [ ] Action items are prioritized
- [ ] Download button works

### Design
- [ ] Dark theme displays correctly
- [ ] Responsive on mobile (resize browser)
- [ ] Animations smooth and not jarring
- [ ] Buttons and inputs are properly styled
- [ ] Footer links work

## Common Issues

### "ANTHROPIC_API_KEY is not defined"
- Make sure `.env.local` exists in the root directory
- Check that `ANTHROPIC_API_KEY=sk-ant-...` is set correctly
- Restart the dev server after changing `.env.local`

### "Failed to fetch website"
- The target website might block scraping
- Try a major site like example.com or wikipedia.org
- Check that the URL starts with http:// or https://

### "Rate limit exceeded"
- This is working as intended (3 roasts per hour)
- Wait an hour or modify `lib/rate-limit.ts` for testing

### Stripe Checkout Shows "Missing Key"
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- This must be the **publishable** key (starts with `pk_`)

## Project Structure Quick Reference

```
app/page.tsx                    # Main landing page
app/success/page.tsx            # Results page after payment
app/api/generate/route.ts       # Free tier API
app/api/checkout/route.ts       # Stripe checkout API
app/api/webhook/route.ts        # Stripe webhook handler
app/globals.css                 # Design system
lib/anthropic.ts                # Claude integration
lib/stripe.ts                   # Stripe integration
lib/rate-limit.ts               # Rate limiting logic
```

## Next Steps After Local Testing

1. **Read the Documentation**
   - README.md - Full project overview
   - DEPLOYMENT.md - How to deploy to Vercel
   - DEVELOPMENT.md - Development patterns and workflows

2. **Before Deploying**
   - Get live Stripe keys (not test keys)
   - Ensure Anthropic API key has sufficient credits
   - Test all flows with test mode first

3. **Deploy to Vercel**
   - Follow steps in DEPLOYMENT.md
   - Takes about 10 minutes
   - No additional setup needed beyond env vars

## Key Files to Understand

### Main Landing Page (`app/page.tsx`)
- 800+ lines implementing the full landing experience
- Free tier form and results
- How it works section
- Free vs Pro comparison
- FAQ accordion
- Footer with links to other tools

### AI Integration (`lib/anthropic.ts`)
- Two main functions:
  - `generateQuickRoast()` - Free tier (quick, 5 issues)
  - `generateFullAudit()` - Paid tier (detailed, 8 categories)
- Prompts Claude to return structured JSON
- Validates and parses responses

### Rate Limiting (`lib/rate-limit.ts`)
- Simple in-memory IP-based tracking
- 3 requests per hour per IP
- Auto-resets when window expires

### Stripe Integration (`lib/stripe.ts`)
- Lazy-initializes Stripe client
- Creates checkout sessions at $9.99
- Verifies webhook signatures

## Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# View project size
npm run build
# Check .next/static folder

# Clean up
rm -rf .next node_modules
npm install
```

## Environment Variables Checklist

- [ ] STRIPE_SECRET_KEY (starts with sk_test_ or sk_live_)
- [ ] STRIPE_PUBLISHABLE_KEY (starts with pk_test_ or pk_live_)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (same as above)
- [ ] ANTHROPIC_API_KEY (starts with sk-ant-)
- [ ] NEXT_PUBLIC_BASE_URL (http://localhost:3000 for local)

## Support

- **Issues?** Check DEPLOYMENT.md troubleshooting section
- **Questions?** Read DEVELOPMENT.md for architectural details
- **Contact:** mudcrabwarrior@gmail.com

---

**Ready?** Run `npm run dev` and visit http://localhost:3000
