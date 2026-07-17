/**
 * Web tip flow — redirects the browser to a Stripe-hosted Checkout Session
 * instead of PaymentSheet (see tipFlow.ts for why this lives in a separate
 * platform-suffixed module rather than branching inside the exit screen).
 * `window.location.href = url` navigates away immediately, so this never
 * resolves to a final status — 'redirecting' is the last state the caller
 * sees before the page unloads. Success/cancel are picked back up on the
 * fresh page load after Stripe redirects back, via the `status` query param
 * on success_url/cancel_url (read by the exit screen itself).
 */
import { createTipCheckoutSession, type TipFlowResult } from '@/lib/tips';

export function useTipFlow() {
  async function startTip(amountCents: number): Promise<TipFlowResult> {
    try {
      const url = await createTipCheckoutSession(amountCents);
      window.location.href = url;
      return { status: 'redirecting' };
    } catch (err) {
      return {
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong — please try again.',
      };
    }
  }

  return { startTip };
}
