/**
 * Web counterpart to StripeRoot.tsx. @stripe/stripe-react-native has no web
 * build at all (no .web.js anywhere in the package), so it must never be
 * imported here — the web exit screen (exit.web.tsx) talks to Stripe
 * Checkout over plain fetch + a browser redirect instead, needing no SDK.
 */
import { Fragment, type PropsWithChildren } from 'react';

export function StripeRoot({ children }: PropsWithChildren) {
  return <Fragment>{children}</Fragment>;
}
