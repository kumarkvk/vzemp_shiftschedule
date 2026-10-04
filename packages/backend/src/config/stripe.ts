import Stripe from 'stripe';
import { config } from './env';
let stripeClient: Stripe | undefined;
export const getStripeClient = (): Stripe => { if (!stripeClient) { stripeClient = new Stripe(config.stripe.secretKey, { apiVersion: '2025-02-24.acacia', typescript: true }); } return stripeClient; };
