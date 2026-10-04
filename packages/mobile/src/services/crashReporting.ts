export function captureError(error: unknown): void {
  if (__DEV__) {
    return;
  }
  void error;
}
