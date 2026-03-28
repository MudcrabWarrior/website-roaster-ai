# Deployment Guide - Website Roaster AI

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Create Stripe account and get API keys
- [ ] Get Anthropic API key
- [ ] Create `.env.local` with all required variables

### 2. Stripe Configuration
- [ ] Create a product for "Website Roaster - Full Audit"
- [ ] Set up pricing at $9.99 USD
- [ ] Configure webhook endpoint (URL will be provided by Vercel)
- [ ] Get webhook signing secret

### 3. Code Review
- [ ] Verify all TypeScript types are correct
- [ ] Check API routes handle errors properly
- [ ] Confirm rate limiting works as expected
- [ ] Test free tier generation locally
- [ ] Test paid tier checkout flow locally

## Local Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.local.example` to `.env.local` and fill in real values:
```bash
cp .env.local.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Test Free Tier
1. Navigate to http://localhost:3000
2. Enter a test website URL (e.g., https://example.com)
3. Click "Roast My Website"
4. Verify the quick roast generates and displays

### 5. Test Paid Tier (Stripe Test Mode)
1. In Stripe Dashboard, switch to Test Mode
2. Use test card: 4242 4242 4242 4242 (expiry: 12/34, CVC: 123)
3. Enter a website URL and click "Get Full Audit"
4. Complete the checkout
5. Verify the success page loads and generates the full audit

### 6. Test Rate Limiting
1. Make 3 free roast requests from the same IP
2. Verify the 4th request is blocked with rate limit message
3. Wait 1 hour (or check in-memory Map is cleared properly)

## Vercel Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Website Roaster AI commit"
git remote add origin https://github.com/yourusername/website-roaster-ai.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Click "Import"

### 3. Set Environment Variables
In Vercel Dashboard > Settings > Environment Variables, add:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 4. Configure Stripe Webhook
1. In Vercel, get your deployment URL
2. In Stripe Dashboard > Webhooks, add endpoint:
   - URL: `https://your-domain.vercel.app/api/webhook`
   - Events: `checkout.session.completed`
   - Click "Add endpoint"
3. Copy the webhook signing secret
4. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Deploy
Click "Deploy" in Vercel. The app will be live at `your-domain.vercel.app`.

## Post-Deployment

### 1. Verify Production
- [ ] Visit https://your-domain.vercel.app
- [ ] Test free tier with a test website
- [ ] Test paid tier with Stripe test card
- [ ] Check that rate limiting works

### 2. Stripe Live Mode
When ready for real payments:
1. In Stripe Dashboard, switch to Live mode
2. Update `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with live keys
3. Verify webhook is configured with live keys

### 3. Domain Configuration
To use a custom domain (e.g., website-roaster.velocityforge.ai):
1. In Vercel > Settings > Domains, add your domain
2. Follow Vercel's DNS configuration instructions
3. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
4. Update Stripe webhook URL to use custom domain

### 4. Analytics
- Monitor Vercel Analytics dashboard for traffic
- Check Stripe dashboard for revenue and conversion rates
- Set up email alerts for errors in Vercel

## Troubleshooting

### Webhook Not Working
- Verify webhook URL is correct in Stripe
- Check that `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Review Vercel logs for 400/401 errors

### Rate Limiting Not Working
- Check that `x-forwarded-for` header is being passed (it is on Vercel by default)
- Verify rate-limit Map implementation in `lib/rate-limit.ts`
- Check rate limiting is set to 3 per hour

### Claude API Errors
- Verify `ANTHROPIC_API_KEY` is correct
- Check API key has sufficient credits
- Monitor Vercel logs for 401/403 errors

### Stripe Checkout Failing
- Verify Stripe keys are correct (live or test, not mixed)
- Check webhook secret is correct
- Verify product/price exists in Stripe

## Scaling Considerations

### Current Architecture
- Rate limiting is in-memory (works on single instance)
- Vercel serverless (scales automatically)
- No database (stateless)

### For Multiple Instances
If scaling beyond single Vercel instance:
1. Replace in-memory rate limit with Redis
2. Use Vercel KV for distributed rate limiting
3. Consider adding database for audit history (optional)

### Cost Optimization
- Current Vercel free tier supports ~100K function invocations/month
- Anthropic API costs ~$0.003 per quick roast, ~$0.01 per full audit
- Stripe fee: 2.9% + $0.30 per transaction
- Breakeven: ~1-2 paid users per day

## Support & Contact

For issues or questions, contact: mudcrabwarrior@gmail.com

Gumroad: velocityforgeai.gumroad.com
