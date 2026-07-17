import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

/**
 * Web-only counterpart to create-payment-intent.ts. @stripe/stripe-react-native
 * has no web build, so the web exit screen can't drive PaymentSheet — instead
 * it creates a Stripe Checkout Session here and redirects the browser to
 * Stripe's own hosted page. Same allow-list abuse-mitigation story as the
 * PaymentIntent endpoint: no auth, but only ever mints a session for one of
 * three fixed preset amounts.
 */

const ALLOWED_AMOUNTS = new Set([300, 500, 1000]); // cents — $3 / $5 / $10
const CURRENCY = 'usd';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
}
if (!process.env.WEB_APP_URL) {
  throw new Error(
    'Missing WEB_APP_URL environment variable — set it to the deployed web app origin (e.g. https://your-portfolio.vercel.app), no trailing slash.',
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-06-24.dahlia',
});
const webAppUrl = process.env.WEB_APP_URL;

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
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: amount,
            product_data: { name: 'Tip — Siddhesh Kasat portfolio' },
          },
        },
      ],
      success_url: `${webAppUrl}/exit?status=success`,
      cancel_url: `${webAppUrl}/exit?status=cancel`,
    });

    if (!session.url) {
      res.status(500).json({ error: 'Stripe did not return a Checkout Session URL.' });
      return;
    }

    res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error creating Checkout Session.';
    res.status(500).json({ error: message });
  }
}
