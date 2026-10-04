describe('Checkout flow', () => {
  it('validates shipping address form', async () => {});
  it('shows order review', async () => {});
  it('starts payment collection', async () => expect(element(by.id('pay-now-button'))).toBeVisible());
  it('handles payment failure gracefully', async () => {});
});
