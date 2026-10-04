export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (__DEV__) {
    return;
  }
  void { name, properties };
}

export function trackScreen(name: string): void {
  if (__DEV__) {
    return;
  }
  void name;
}
