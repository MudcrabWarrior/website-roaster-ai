import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body as { url?: string }

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const stripe = getStripe()
    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID is not defined')
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://website-roaster-ai.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseUrl,
      metadata: { url },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
