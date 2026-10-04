# Mobile App Guide

## Stack

- Expo SDK 51 + React Native + TypeScript strict mode
- React Navigation (stack, tabs, drawer)
- Redux Toolkit + redux-persist
- React Hook Form + Zod
- Axios API client with token refresh hooks
- Expo Secure Store for auth session storage
- Stripe React Native SDK for payments
- Detox for end-to-end automation scaffolding

## Commands

```bash
cd packages/mobile
pnpm install
pnpm start
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
```

## Environment

Copy `packages/mobile/.env.example` to `.env` or your CI secret store and set:

```bash
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_ANALYTICS_KEY=
```

## Navigation

- `AuthNavigator`: login, register, forgot password
- `MainTabs`: home, products, cart, orders, profile
- `AppNavigator`: drawer + stack for checkout, order details, admin
- `src/config/linking.ts`: deep-link definitions

## Testing coverage

- Unit tests for formatting, validation, and cart state
- Detox suites covering auth, catalog, cart, checkout, orders, and admin flows

## CI/CD

- `packages/mobile/eas.json` is ready for development, preview, and production builds
- `docker/Dockerfile.mobile` packages the mobile workspace for CI validation or Expo dev server usage
