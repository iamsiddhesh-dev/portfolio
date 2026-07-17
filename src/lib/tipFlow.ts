/**
 * Native tip flow — Stripe PaymentSheet. Split by platform (tipFlow.web.ts is
 * the counterpart) so the exit screen itself can stay ONE route file: Expo
 * Router's app-directory context enumerates every physical filename it finds
 * (including the extension), so a sibling exit.web.tsx would still drag this
 * file's @stripe/stripe-react-native import into the web bundle. Keeping the
 * split at this plain-module level instead works, because plain `import`
 * specifiers (not directory-context enumeration) do respect Metro's
 * per-platform extension resolution.
 */
import { useStripe } from '@stripe/stripe-react-native';

import { createTipPaymentIntent, TipIntentError, type TipFlowResult } from '@/lib/tips';

export function useTipFlow() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function startTip(amountCents: number): Promise<TipFlowResult> {
    try {
      const clientSecret = await createTipPaymentIntent(amountCents);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Siddhesh Kasat',
        paymentIntentClientSecret: clientSecret,
      });
      if (initError) throw new TipIntentError(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') return { status: 'cancelled' };
        throw new TipIntentError(presentError.message);
      }

      return { status: 'success' };
    } catch (err) {
      return {
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong — please try again.',
      };
    }
  }

  return { startTip };
}
