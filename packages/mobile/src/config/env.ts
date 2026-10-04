export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder',
  environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  analyticsKey: process.env.EXPO_PUBLIC_ANALYTICS_KEY ?? '',
} as const;

export const isProduction = env.environment === 'production';
