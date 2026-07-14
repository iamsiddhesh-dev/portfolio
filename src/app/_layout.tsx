import { useEffect } from 'react';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fontAssets } from '@/theme/fonts';
import { theme } from '@/theme/theme';

// Hold the native splash until Clash Display + Satoshi are registered, so the
// first paint is already on-brand (no system-font flash).
SplashScreen.preventAutoHideAsync();

if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — copy .env.example to .env.local and fill in your Clerk publishable key.',
  );
}
const publishableKey: string = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY — copy .env.example to .env.local and fill in your Stripe test publishable key.',
  );
}
const stripePublishableKey: string = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <StripeProvider publishableKey={stripePublishableKey}>
          <GestureHandlerRootView style={styles.root}>
            <SafeAreaProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </StripeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

/**
 * Signed-out visitors only ever see (entry); signing in/up flips `isSignedIn`
 * and Stack.Protected swaps the whole navigator over to (portfolio) + (exit).
 */
function RootNavigator() {
  const { isSignedIn } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(entry)" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(portfolio)" />
        <Stack.Screen name="(exit)" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = {
  root: { flex: 1, backgroundColor: theme.colors.bg },
} as const;
