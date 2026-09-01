import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { payfastService } from '../../services/payfastService';
import { X, Check, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    authUser,
    updateUserProfile,
    showToast,
    openAuthModal,
  } = useApp();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      if (!authUser || authUser.isGuest) {
        showToast('Please sign in or create an account to activate Pro sync.', 'info');
        setIsUpgradeModalOpen(false);
        openAuthModal('register');
        setLoading(false);
        return;
      }

      // If user is logged in, initiate PayFast checkout
      payfastService.initiateSubscriptionCheckout({
        tier: billingPeriod,
        user: authUser,
      });
    } catch (err: any) {
      showToast(err.message || 'Payment initiation failed. Please try again.', 'warning');
      setLoading(false);
    }
  };

  // Demo direct activation bypass for instant testing
  const handleInstantDemoUpgrade = () => {
    updateUserProfile({
      subscriptionTier: 'pro',
      subscriptionPeriod: billingPeriod,
      subscriptionStatus: 'active',
    });
    showToast(`🎉 Upgraded to NutriPlan Pro (${billingPeriod})!`, 'success');
    setIsUpgradeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#E8EDE9] flex flex-col max-h-[92vh]">
        {/* Header Hero Banner */}
        <div className="p-6 bg-gradient-to-br from-[#17211B] via-[#1F3326] to-[#17211B] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#3FAE68]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3FAE68]/20 border border-[#3FAE68]/40 text-[#3FAE68] text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NutriPlan Pro Membership</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Supercharge Your Health
              </h2>
              <p className="text-xs text-white/80 mt-1 max-w-sm">
                Unlock automated South African meal rotation, unlimited AI NutriCoach, and deep health analytics.
              </p>
            </div>

            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Billing Cycle Toggle */}
          <div className="bg-[#F4F6F4] p-1.5 rounded-2xl flex items-center gap-1 border border-[#E8EDE9]">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition text-center ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-[#17211B] shadow-xs'
                  : 'text-[#6B756C] hover:text-[#17211B]'
              }`}
            >
              Monthly (R69 / mo)
            </button>

            <button
              type="button"
              onClick={() => setBillingPeriod('annual')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition text-center flex items-center justify-center gap-1.5 ${
                billingPeriod === 'annual'
                  ? 'bg-white text-[#17211B] shadow-xs'
                  : 'text-[#6B756C] hover:text-[#17211B]'
              }`}
            >
              <span>Annual (R579 / yr)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#3FAE68] text-white text-[9px] font-black">
                SAVE 30%
              </span>
            </button>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-4 rounded-2xl bg-[#EAF7EF]/60 border border-[#3FAE68]/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B756C] uppercase tracking-wider block">
                {billingPeriod === 'annual' ? 'Annual Subscription' : 'Monthly Subscription'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-[#17211B]">
                  {billingPeriod === 'annual' ? 'R579' : 'R69'}
                </span>
                <span className="text-xs text-[#6B756C]">
                  {billingPeriod === 'annual' ? '/ year (R48.25/mo)' : '/ month'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-white border border-[#3FAE68]/30 text-[#2C854E] text-[10px] font-black shadow-2xs">
                Recurring via PayFast
              </span>
              <p className="text-[9px] text-[#6B756C] mt-1">Cancel anytime in 1-click</p>
            </div>
          </div>

          {/* Value Proposition Bullets */}
          <div className="space-y-2.5">
            <h4 className="font-black text-xs text-[#17211B] uppercase tracking-wider">
              Everything included in Pro:
            </h4>
            {[
              { title: 'Unlimited Weekly Plan Recalculations', desc: 'Swap meals, adapt macros, and generate fresh South African recipes weekly.' },
              { title: 'Full 7-Day Weight Loss & Macro Analytics Curves', desc: 'Track your weight curve, caloric deficit balance, and hydration averages.' },
              { title: 'Instant Grocery List PDF & WhatsApp Export', desc: 'Take your smart ZAR shopping list straight to Checkers, Shoprite or Woolworths.' },
              { title: 'Unlimited NutriCoach AI Food & Starch Advice', desc: 'Ask about any local meal, load shedding food hacks, or braai day balance.' },
              { title: 'Permanent Supabase Cloud Backup', desc: 'Never lose your progress or meal logs across mobile and desktop devices.' },
            ].map((prop, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F8F9FA] transition">
                <div className="w-5 h-5 rounded-full bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-[#17211B] block">{prop.title}</span>
                  <span className="text-[11px] text-[#6B756C] leading-tight block">{prop.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#FFFDF8] border-t border-[#E8EDE9] space-y-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#3FAE68] hover:bg-[#349859] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>
              {loading
                ? 'Connecting to PayFast...'
                : billingPeriod === 'annual'
                ? 'Upgrade to NutriPlan Pro — R579/yr'
                : 'Upgrade to NutriPlan Pro — R69/mo'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pt-1 text-[10px] text-[#6B756C]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3FAE68]" />
              Secured by PayFast South Africa
            </span>
            <button
              type="button"
              onClick={handleInstantDemoUpgrade}
              className="text-[#2C854E] hover:underline font-bold"
            >
              [Test Mode: Activate Pro Instantly]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};