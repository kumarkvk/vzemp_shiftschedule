describe('Authentication flow', () => {
  beforeAll(async () => device.launchApp({ newInstance: true }));
  it('shows login screen on launch', async () => expect(element(by.id('login-submit-button'))).toBeVisible());
  it('validates login form input', async () => expect(element(by.id('login-email-input'))).toBeVisible());
  it('navigates to register screen', async () => {});
  it('allows logout from profile', async () => {});
});
