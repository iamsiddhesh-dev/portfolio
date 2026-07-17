/**
 * Native-only wrapper around @stripe/stripe-react-native's StripeProvider.
 * This file is picked for iOS/Android; StripeRoot.web.tsx (no Stripe import
 * at all — the package has zero web build output) is picked for web via
 * Metro's platform-extension resolution.
 */
import { Fragment, type PropsWithChildren } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

if (!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY — copy .env.example to .env.local and fill in your Stripe test publishable key.',
  );
}
const stripePublishableKey: string = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function StripeRoot({ children }: PropsWithChildren) {
  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <Fragment>{children}</Fragment>
    </StripeProvider>
  );
}
