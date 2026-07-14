/**
 * Talks to the one serverless endpoint (server/api/create-payment-intent.ts)
 * that mints a Stripe PaymentIntent. Amounts here must match ALLOWED_AMOUNTS
 * server-side, or the request is rejected.
 */

export type TipPreset = {
  id: string;
  /** Cents — what actually gets charged and sent to the server. */
  amountCents: number;
  label: string;
  blurb: string;
};

export const tipPresets: TipPreset[] = [
  { id: 'small', amountCents: 300, label: '$3', blurb: 'A coffee' },
  { id: 'medium', amountCents: 500, label: '$5', blurb: 'A good coffee' },
  { id: 'large', amountCents: 1000, label: '$10', blurb: 'Round of coffees' },
];

if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  throw new Error(
    'Missing EXPO_PUBLIC_API_BASE_URL — copy .env.example to .env.local and fill in the deployed tip-server URL.',
  );
}
const apiBaseUrl: string = process.env.EXPO_PUBLIC_API_BASE_URL;

export class TipIntentError extends Error {}

export async function createTipPaymentIntent(amountCents: number): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/api/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountCents }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new TipIntentError(json?.error ?? 'Could not start the tip — please try again.');
  }

  return json.clientSecret as string;
}
