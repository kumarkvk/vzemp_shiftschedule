interface ErrorContext {
  area: string;
  metadata?: Record<string, unknown>;
}

export const reportError = (error: unknown, context: ErrorContext): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('app:error', {
      detail: {
        error,
        context,
      },
    }),
  );
};

export const trackEvent = (name: string, properties?: Record<string, unknown>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: name,
    ...properties,
  });
};
