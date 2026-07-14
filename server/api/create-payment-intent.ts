import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

/**
 * Creates a Stripe PaymentIntent for the portfolio's "buy me a coffee" tip
 * flow. Test mode only — this endpoint has no auth because it only ever
 * mints intents for a fixed, tiny set of preset amounts (see ALLOWED_AMOUNTS),
 * capping the blast radius of it being public.
 */

const ALLOWED_AMOUNTS = new Set([300, 500, 1000]); // cents — $3 / $5 / $10
const CURRENCY = 'usd';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-06-24.dahlia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const amount = req.body?.amount;

  if (typeof amount !== 'number' || !ALLOWED_AMOUNTS.has(amount)) {
    res.status(400).json({ error: 'amount must be one of the preset tip amounts (in cents).' });
    return;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error creating PaymentIntent.';
    res.status(500).json({ error: message });
  }
}
