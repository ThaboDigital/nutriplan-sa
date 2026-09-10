import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { payfastService } from '../../services/payfastService';
import { AuthUser } from '../../services/authService';
import { X, Check, Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    authUser,
    userProfile,
    showToast,
    openAuthModal,
  } = useApp();

  // R49 (monthly) is pre-selected by default
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');

  // Check if client is already logged in (via Context, localStorage, or userProfile)
  const activeUser: AuthUser | null = useMemo(() => {
    // 1. Context authUser
    if (authUser && !authUser.isGuest) {
      return {
        ...authUser,
        email: authUser.email || (userProfile as any)?.email || 'subscriber@nutriplans.co.za',
        name: authUser.name || userProfile.name || 'Subscriber',
      };
    }

    // 2. Saved auth user in localStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nutriplan_auth_user') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.isGuest) {
          return {
            ...parsed,
            email: parsed.email || (userProfile as any)?.email || 'subscriber@nutriplans.co.za',
            name: parsed.name || userProfile.name || 'Subscriber',
          };
        }
      } catch (e) {
        console.error('Error parsing saved auth user', e);
      }
    }

    // 3. User with custom profile
    if (userProfile && (userProfile as any).email) {
      return {
        id: userProfile.id || 'usr_' + Date.now(),
        email: (userProfile as any).email,
        name: userProfile.name || 'Subscriber',
        isGuest: false,
        subscriptionTier: userProfile.subscriptionTier || 'free',
      };
    }

    return null;
  }, [authUser, userProfile]);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      const userToCheckout = activeUser || (guestEmail.trim() ? {
        id: 'usr_' + Date.now(),
        email: guestEmail.trim(),
        name: userProfile.name && userProfile.name !== 'New User' ? userProfile.name : 'Subscriber',
        isGuest: false,
        subscriptionTier: 'free' as const,
      } : null);

      if (userToCheckout && userToCheckout.email) {
        localStorage.setItem('nutriplan_auth_user', JSON.stringify(userToCheckout));
        payfastService.initiateSubscriptionCheckout({
          tier: billingPeriod,
          user: userToCheckout,
        });
        return;
      }

      // If no account and no email entered:
      showToast('Please enter your email to proceed to secure PayFast checkout.', 'info');
      setLoading(false);
    } catch (err: any) {
      showToast(err.message || 'Payment initiation failed. Please try again.', 'warning');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#E8EDE9] flex flex-col max-h-[92vh]">
        {/* 1. Header Hero Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#17211B] via-[#1F3326] to-[#17211B] text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#3FAE68]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3FAE68]/20 border border-[#3FAE68]/40 text-[#3FAE68] text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NutriPlan Pro Membership</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Upgrade to NutriPlan Pro
              </h2>
              <p className="text-xs text-white/80 mt-1 max-w-sm">
                Personalized South African meal plans, unlimited AI NutriCoach, and deep nutrition analytics.
              </p>
            </div>

            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Active Account Status Pill (Confirms client is logged in and will NOT be asked to log in again) */}
          {activeUser ? (
            <div className="px-3.5 py-2 rounded-2xl bg-[#EAF7EF] border border-[#3FAE68]/30 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#3FAE68] animate-pulse shrink-0" />
                <span className="text-[#2C854E] font-bold shrink-0">Account:</span>
                <span className="font-black text-[#17211B] truncate">{activeUser.email}</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-[#2C854E] shrink-0 shadow-2xs">
                Logged In ✓
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17211B]">Email for PayFast Receipt & Activation:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsUpgradeModalOpen(false);
                    openAuthModal('login');
                  }}
                  className="text-[#2C854E] hover:underline font-bold text-[10px]"
                >
                  Already registered? Sign in
                </button>
              </div>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-[#E8EDE9] text-xs font-semibold focus:outline-none focus:border-[#3FAE68] bg-white"
              />
            </div>
          )}

          {/* Plan Selection Cards: R49 Monthly (Pre-selected) vs Annual */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6B756C] block">
              Choose Your Plan
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Monthly R49 (Pre-selected) */}
              <div
                onClick={() => setBillingPeriod('monthly')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between relative ${
                  billingPeriod === 'monthly'
                    ? 'bg-[#EAF7EF]/50 border-[#3FAE68] shadow-sm'
                    : 'bg-white border-[#E8EDE9] hover:border-[#3FAE68]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#17211B]">Monthly Plan</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    billingPeriod === 'monthly' ? 'text-[#3FAE68]' : 'text-gray-300'
                  }`}>
                    {billingPeriod === 'monthly' ? (
                      <CheckCircle2 className="w-5 h-5 fill-current" />
                    ) : (
                      <Circle className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </div>
                </div>

                <div className="mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#17211B]">R49</span>
                    <span className="text-xs text-[#6B756C] font-semibold">/ month</span>
                  </div>
                  <p className="text-[11px] text-[#6B756C] mt-1">
                    Flexible monthly billing in ZAR. Cancel anytime in 1-click.
                  </p>
                </div>
              </div>

              {/* Option 2: Annual R399 (Save 32%) */}
              <div
                onClick={() => setBillingPeriod('annual')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between relative ${
                  billingPeriod === 'annual'
                    ? 'bg-[#EAF7EF]/50 border-[#3FAE68] shadow-sm'
                    : 'bg-white border-[#E8EDE9] hover:border-[#3FAE68]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#17211B]">Annual Plan</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    billingPeriod === 'annual' ? 'text-[#3FAE68]' : 'text-gray-300'
                  }`}>
                    {billingPeriod === 'annual' ? (
                      <CheckCircle2 className="w-5 h-5 fill-current" />
                    ) : (
                      <Circle className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </div>
                </div>

                <div className="mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#17211B]">R399</span>
                    <span className="text-xs text-[#6B756C] font-semibold">/ year</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-[#3FAE68] text-white text-[9px] font-black">
                      SAVE 32%
                    </span>
                    <span className="text-[10px] text-[#2C854E] font-bold">
                      R33.25/month equiv.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Price Summary Callout */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#6B756C] uppercase tracking-wider block">
                Total Due Today
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-[#17211B]">
                  {billingPeriod === 'monthly' ? 'R49.00' : 'R399.00'}
                </span>
                <span className="text-xs text-[#6B756C]">
                  {billingPeriod === 'monthly' ? 'ZAR (Billed Monthly)' : 'ZAR (Billed Annually)'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-[#EAF7EF] border border-[#3FAE68]/30 text-[#2C854E] text-[10px] font-black shadow-2xs">
                No Contract • Cancel Anytime
              </span>
            </div>
          </div>

          {/* Value Proposition Checklist */}
          <div className="space-y-2 pt-1">
            <h4 className="font-black text-xs text-[#17211B] uppercase tracking-wider">
              Everything Included in NutriPlan Pro:
            </h4>
            {[
              { title: 'Unlimited 7-Day Meal Plan Rotations', desc: 'Swap meals, recalculate calories, and generate fresh weekly recipes.' },
              { title: 'Smart South African Starch Swaps', desc: 'Healthier alternatives for pap, white rice, and bread without losing flavour.' },
              { title: 'Unlimited 24/7 AI NutriCoach', desc: 'Personalized braai strategies, biltong snack balance, and grocery advice.' },
              { title: 'Instant WhatsApp & PDF Grocery Exports', desc: 'Export your categorized ingredient list directly to WhatsApp in ZAR.' },
              { title: 'Permanent Multi-Device Cloud Sync', desc: 'Access your diary, habits, and progress seamlessly on mobile and desktop.' },
            ].map((prop, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F8F9FA] transition">
                <div className="w-5 h-5 rounded-full bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-black text-[#17211B] block">{prop.title}</span>
                  <span className="text-[11px] text-[#6B756C] leading-tight block">{prop.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Footer Action Button */}
        <div className="p-4 sm:p-5 bg-[#FFFDF8] border-t border-[#E8EDE9] space-y-2 shrink-0">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#3FAE68] hover:bg-[#349859] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>
              {loading
                ? 'Connecting to PayFast...'
                : billingPeriod === 'monthly'
                ? 'Upgrade to NutriPlan Pro — R49 / month'
                : 'Upgrade to NutriPlan Pro — R399 / year'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center pt-1 text-[10px] text-[#6B756C]">
            <span className="flex items-center gap-1.5 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3FAE68] shrink-0" />
              Secured by PayFast South Africa (Visa, Mastercard, Capitec Pay, Instant EFT)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};