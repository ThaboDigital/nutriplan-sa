import { AuthUser } from './authService';

export interface PayFastSubscriptionParams {
  tier: 'monthly' | 'annual';
  user: AuthUser;
  returnUrl?: string;
  cancelUrl?: string;
}

export const PAYFAST_PLANS = {
  monthly: {
    name: 'NutriPlan SA Pro (Monthly Subscription)',
    price: 69.00,
    frequency: '3', // 3 = Monthly
    cycles: 0, // 0 = indefinite until cancelled
    description: 'Unlimited AI NutriCoach, automated grocery cart syncing, and South African recipe swaps.',
  },
  annual: {
    name: 'NutriPlan SA Pro (Annual Plan - 30% Off)',
    price: 579.00,
    frequency: '6', // 6 = Annual
    cycles: 0,
    description: '12 months unlimited access to NutriPlan SA Pro with priority meal planning and support.',
  },
};

export const payfastService = {
  getMerchantCredentials() {
    const isProd = import.meta.env.VITE_PAYFAST_ENV === 'production' || import.meta.env.PROD;
    const merchantId = import.meta.env.VITE_PAYFAST_MERCHANT_ID || '10000100'; // Default Sandbox Merchant ID
    const merchantKey = import.meta.env.VITE_PAYFAST_MERCHANT_KEY || '46f0cd694581a'; // Default Sandbox Key
    const processUrl = isProd
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    return { merchantId, merchantKey, processUrl, isProd };
  },

  getNextBillingDate(tier: 'monthly' | 'annual'): string {
    const next = new Date();
    if (tier === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setFullYear(next.getFullYear() + 1);
    }
    return next.toISOString().split('T')[0];
  },

  generatePayload({ tier, user, returnUrl, cancelUrl }: PayFastSubscriptionParams) {
    const { merchantId, merchantKey } = this.getMerchantCredentials();
    const plan = PAYFAST_PLANS[tier];
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nutriplan-sa.vercel.app';

    const finalReturnUrl = returnUrl || `${origin}/?payment=success&tier=${tier}`;
    const finalCancelUrl = cancelUrl || `${origin}/?payment=cancelled`;

    const nextBillingDate = this.getNextBillingDate(tier);

    // PayFast subscription fields
    const data: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: finalReturnUrl,
      cancel_url: finalCancelUrl,
      notify_url: `${origin}/api/payfast-itn`,
      name_first: user.name.split(' ')[0] || 'User',
      name_last: user.name.split(' ').slice(1).join(' ') || 'Subscriber',
      email_address: user.email || 'customer@nutriplans.co.za',
      cell_number: user.cellNumber || '0821234567',
      m_payment_id: `NP_${tier.toUpperCase()}_${user.id.slice(0, 8)}_${Date.now()}`,
      amount: plan.price.toFixed(2),
      item_name: plan.name,
      item_description: plan.description,
      subscription_type: '1', // 1 = Subscription
      billing_date: nextBillingDate,
      recurring_amount: plan.price.toFixed(2),
      frequency: plan.frequency,
      cycles: String(plan.cycles),
      custom_str1: user.id,
      custom_str2: `pro_${tier}`,
    };

    return data;
  },

  initiateSubscriptionCheckout(params: PayFastSubscriptionParams) {
    const { processUrl } = this.getMerchantCredentials();
    const payload = this.generatePayload(params);

    // Create an invisible auto-submitting form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = processUrl;
    form.style.display = 'none';

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  },
};