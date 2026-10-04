const runtimeEnv = window.__APP_ENV__ ?? {};

const getEnv = (key: string, fallback = ''): string => {
  const runtimeValue = runtimeEnv[key];
  return runtimeValue ?? import.meta.env[key] ?? fallback;
};

const stripeKey = getEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_dummy');

export const env = {
  VITE_API_URL: getEnv('VITE_API_URL', 'http://localhost:3000'),
  VITE_STRIPE_PUBLISHABLE_KEY: stripeKey,
  VITE_ENABLE_PROFILER: getEnv('VITE_ENABLE_PROFILER', 'false') === 'true',
  VITE_ANALYTICS_KEY: getEnv('VITE_ANALYTICS_KEY', ''),
  VITE_ENABLE_DEVTOOLS: getEnv('VITE_ENABLE_DEVTOOLS', 'true') === 'true',
  hasStripeElements: stripeKey.startsWith('pk_') && !stripeKey.includes('dummy'),
  appVersion: __APP_VERSION__,
} as const;
