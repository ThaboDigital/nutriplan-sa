import { supabase } from './supabaseClient';

export interface SendSubscriptionEmailParams {
  to: string;
  name?: string;
  tier?: 'monthly' | 'annual';
  amount?: number;
  type?: 'welcome_pro' | 'subscription_receipt' | 'test';
  customSender?: string;
  resendApiKey?: string;
}

export const resendEmailService = {
  getStoredApiKey(): string {
    return localStorage.getItem('nutriplan_resend_api_key') || import.meta.env.VITE_RESEND_API_KEY || '';
  },

  setStoredApiKey(key: string): void {
    if (key) {
      localStorage.setItem('nutriplan_resend_api_key', key.trim());
    } else {
      localStorage.removeItem('nutriplan_resend_api_key');
    }
  },

  getStoredSender(): string {
    return localStorage.getItem('nutriplan_resend_sender') || 'NutriPlan SA <notifications@thabosystems.co.za>';
  },

  setStoredSender(sender: string): void {
    if (sender) {
      localStorage.setItem('nutriplan_resend_sender', sender.trim());
    }
  },

  async sendSubscriptionWelcomeEmail(params: SendSubscriptionEmailParams): Promise<{ success: boolean; message: string; data?: any; requiresKey?: boolean }> {
    if (!params.to) {
      return { success: false, message: 'Recipient email is required.' };
    }

    const apiKey = params.resendApiKey || this.getStoredApiKey();
    const sender = params.customSender || this.getStoredSender();

    try {
      const { data, error } = await supabase.functions.invoke('send-subscription-email', {
        body: {
          to: params.to,
          name: params.name || params.to.split('@')[0],
          tier: params.tier || 'monthly',
          amount: params.amount ?? (params.tier === 'annual' ? 399.00 : 49.00),
          type: params.type || 'welcome_pro',
          resendApiKey: apiKey || undefined,
          customSender: sender || undefined,
        },
      });

      if (error) {
        return { success: false, message: error.message || 'Failed to call email service.' };
      }

      if (data?.requiresKey) {
        return { success: false, message: data.error, requiresKey: true };
      }

      if (data?.error) {
        return { success: false, message: data.error, data };
      }

      // Record in Supabase email_logs table
      try {
        await supabase.from('email_logs').insert({
          recipient_email: params.to,
          recipient_name: params.name,
          email_type: params.type || 'welcome_pro',
          tier: params.tier || 'monthly',
          amount_zar: params.amount ?? (params.tier === 'annual' ? 399.00 : 49.00),
          resend_id: data?.data?.id || null,
          status: 'sent',
        });
      } catch (logErr) {
        console.warn('Email log write notice:', logErr);
      }

      return {
        success: true,
        message: `Subscription email successfully sent to ${params.to}!`,
        data,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Unexpected error sending email.' };
    }
  },
};
