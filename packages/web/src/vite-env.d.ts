/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface Window {
  __APP_ENV__?: Record<string, string | undefined>;
  dataLayer?: Array<Record<string, unknown>>;
}
