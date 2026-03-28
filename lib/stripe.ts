import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  }
  return stripeInstance
}
