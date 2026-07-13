import { Stack } from 'expo-router';

import { theme } from '@/theme/theme';

export default function PortfolioLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    />
  );
}
