import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Bell, RotateCcw, Smartphone, Download, LogOut, LogIn, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    resetToDemo,
    setShowOnboardingWizard,
    notificationPreferences,
    updateNotificationPreferences,
    showToast,
    promptInstallApp,
    openUpgradeModal,
    setActiveTab,
    authUser,
    setAuthUser,
    openAuthModal,
  } = useApp();

  const effectiveUser = authUser || (() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nutriplan_auth_user') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.isGuest && parsed.email) return parsed;
      } catch (e) {}
    }
    return null;
  })();

  const handleLogout = async () => {
    await authService.signOut();
    setAuthUser(null);
    localStorage.removeItem('nutriplan_auth_user');
    showToast('Signed out of cloud account', 'info');
  };

  const isAdmin = authUser?.role === 'admin' || userProfile?.role === 'admin';
  const isPro = userProfile?.subscriptionTier === 'pro';

  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(userProfile.weightKg.toString());

  const handleSaveWeight = () => {
    const val = parseFloat(tempWeight);
    if (!isNaN(val) && val > 30 && val < 250) {
      updateUserProfile({ weightKg: val });
      setIsEditingWeight(false);
      showToast(`Weight updated to ${val} kg. Macro targets adjusted!`, 'success');
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17211B] tracking-tight">Profile & Goals</h1>
          <p className="text-xs sm:text-sm font-medium text-[#6B756C]">Personalized nutrition settings</p>
        </div>

        <button
          onClick={() => setShowOnboardingWizard(true)}
          className="px-3.5 py-2 rounded-full bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/20 text-xs font-bold transition active:scale-95"
        >
          Re-run Onboarding
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8EDE9] subtle-shadow">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#17211B] text-white flex items-center justify-center font-black text-2xl shadow-sm">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black text-[#17211B]">{userProfile.name}</h2>
            <p className="text-xs font-semibold text-[#6B756C]">
              {userProfile.age} yrs • {userProfile.heightCm} cm • South Africa
            </p>
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF7EF] text-[#2C854E] mt-1.5 capitalize">
              Goal: {userProfile.mainGoal.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-[#F0F2F0]">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] text-center sm:text-left">
            <span className="text-[10px] font-bold text-[#6B756C] block">Weight</span>
            {isEditingWeight ? (
              <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
                <input
                  type="number"
                  value={tempWeight}
                  onChange={e => setTempWeight(e.target.value)}
                  className="w-14 text-xs font-black border rounded-lg px-1 py-0.5 bg-white text-center"
                />
                <button
                  onClick={handleSaveWeight}
                  className="px-2 py-0.5 rounded-lg bg-[#3FAE68] text-white text-[10px] font-bold"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingWeight(true)}
                className="text-sm sm:text-base font-black text-[#17211B] mt-0.5 cursor-pointer hover:text-[#3FAE68] transition"
                title="Click to edit weight"
              >
                {userProfile.weightKg} kg
              </div>
            )}
            <span className="text-[9px] sm:text-[10px] text-[#6B756C] block truncate">Goal: {userProfile.targetWeightKg}kg</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] text-center sm:text-left">
            <span className="text-[10px] font-bold text-[#6B756C] block">Meals/Day</span>
            <span className="text-sm sm:text-base font-black text-[#17211B] mt-0.5 block">
              {userProfile.mealsPerDay} Meals
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#6B756C] block truncate">Plan</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] text-center sm:text-left">
            <span className="text-[10px] font-bold text-[#6B756C] block">Daily Water</span>
            <span className="text-sm sm:text-base font-black text-[#3FAE68] mt-0.5 block">
              {userProfile.dailyWaterTargetLiters} L
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#6B756C] block truncate">Hydration</span>
          </div>
        </div>
      </div>

      {/* Responsive 2-column Grid on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dietary & Budget Preferences */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow space-y-4">
          <h3 className="font-extrabold text-sm text-[#17211B]">Dietary Preferences & Budget</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#6B756C]">Diet Strategy</span>
              <span className="font-bold text-[#17211B] capitalize">
                {userProfile.dietaryPreference.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6B756C]">Meal Timings</span>
              <span className="font-bold text-[#17211B]">
                {userProfile.preferredEatingTimes.join(' • ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6B756C]">Weekly Grocery Budget</span>
              <span className="font-bold text-[#3FAE68]">
                {userProfile.weeklyBudget} / week
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6B756C]">Track Calories & Macros</span>
              <button
                onClick={() => updateUserProfile({ trackCalories: !userProfile.trackCalories })}
                className={`px-3 py-1 rounded-xl font-bold transition ${
                  userProfile.trackCalories
                    ? 'bg-[#3FAE68] text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {userProfile.trackCalories ? 'Enabled' : 'Hidden'}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#F0F2F0]">
              <span className="text-[#6B756C]">Foods Specifically Avoided:</span>
              <div className="flex flex-wrap gap-1.5">
                {userProfile.foodsAvoided.map(item => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded-lg bg-[#FFFDF8] border border-[#F0EBE1] text-[11px] font-semibold text-[#17211B]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Categories Toggles */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#3FAE68]" />
            <h3 className="font-extrabold text-sm text-[#17211B]">Notification Preferences</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Water Reminders', key: 'waterReminders' as const },
              { label: 'Upcoming Meal Alerts', key: 'mealReminders' as const },
              { label: 'Shopping & Grocery Alerts', key: 'shoppingAlerts' as const },
              { label: 'Movement & Walk Prompts', key: 'movementReminders' as const },
              { label: 'Sleep Quiet Hours (22:00 - 06:30)', key: 'quietHoursEnabled' as const },
            ].map(pref => (
              <div key={pref.key} className="flex items-center justify-between p-2 rounded-xl bg-[#F8F9FA]">
                <span className="font-semibold text-[#17211B]">{pref.label}</span>
                <input
                  type="checkbox"
                  checked={!!notificationPreferences[pref.key]}
                  onChange={e => updateNotificationPreferences({ [pref.key]: e.target.checked })}
                  className="rounded text-[#3FAE68] focus:ring-[#3FAE68] w-4 h-4"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Tier Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#17211B] uppercase tracking-wider">
                Subscription Status
              </span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isPro
                  ? 'bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/30'
                  : 'bg-[#F4F6F4] text-[#6B756C]'
              }`}
            >
              {isPro ? 'PRO ACTIVE' : 'FREE TIER'}
            </span>
          </div>

          {isPro ? (
            <div className="p-3.5 rounded-2xl bg-[#EAF7EF]/60 border border-[#3FAE68]/20 text-xs">
              <p className="font-extrabold text-[#2C854E]">✨ Unlimited Pro Access Active</p>
              <p className="text-[11px] text-[#6B756C] mt-0.5">
                Enjoy unlimited weekly plan recalculations, 7-day macro curves, and AI NutriCoach.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#17211B] block">Upgrade to NutriPlan Pro</span>
                  <span className="text-[10px] text-[#6B756C]">Save 32% on Annual Plan (R33/mo equivalent) — From R49/mo</span>
                </div>
                <button
                  onClick={() => openUpgradeModal('Profile Upgrade')}
                  className="px-3.5 py-2 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] font-bold text-xs shadow-xs transition active:scale-95 shrink-0"
                >
                  Upgrade
                </button>
              </div>
            </div>
          )}

          {/* Account & Session Management (Mobile & Desktop) */}
          <div className="pt-3 border-t border-[#F0EBE1] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#17211B] uppercase tracking-wider">
                Account & Cloud Sync
              </span>
              {effectiveUser ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#3FAE68]" />
                  <span>Cloud Synced</span>
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Guest Mode
                </span>
              )}
            </div>

            {effectiveUser ? (
              <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#17211B] text-white flex items-center justify-center font-black text-xs shrink-0">
                    {effectiveUser.name ? effectiveUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-[#17211B] block truncate">{effectiveUser.name}</span>
                    <span className="text-[11px] text-[#6B756C] block truncate">{effectiveUser.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-2xs"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#EAF7EF]/50 border border-[#3FAE68]/20 space-y-2">
                <p className="text-[11px] text-[#6B756C] leading-snug">
                  Currently running locally as guest. Create an account to backup your meal plans and access them across devices.
                </p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full py-2.5 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Create Account / Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Admin Console Shortcut */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#17211B] text-white hover:bg-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-[#3FAE68]" />
              <span>Open Admin & Revenue Console</span>
            </button>
          )}
        </div>

        {/* Right side group: PWA & Safety Disclaimer */}
        <div className="space-y-5">
          {/* PWA Mobile App Installation Card */}
          <div className="bg-[#EAF7EF]/70 rounded-3xl p-4 border border-[#3FAE68]/20 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#3FAE68] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-[#17211B]">Install NutriPlan App</h4>
                <p className="text-[11px] text-[#2C854E]">Fast offline access & home screen widget</p>
              </div>
            </div>

            <button
              onClick={promptInstallApp}
              className="px-3.5 py-2 rounded-xl bg-[#17211B] text-white hover:bg-black text-xs font-bold shrink-0 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#3FAE68]" />
              <span>Install</span>
            </button>
          </div>

          {/* Safety & Medical Disclaimer */}
          <div className="bg-[#FFFDF8] rounded-3xl p-4 border border-[#F0EBE1] text-[11px] text-[#6B756C] space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[#17211B] text-xs">
              <Shield className="w-4 h-4 text-[#3FAE68]" />
              <span>Health & Wellness Safety Notice</span>
            </div>
            <p>
              NutriPlan SA provides general nutrition and wellness information and is not a substitute for professional medical advice. If you have a medical condition, take medication, or are pregnant, please consult a qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>

      {/* Reset / New Plan */}
      <div className="pt-2">
        <button
          onClick={resetToDemo}
          className="w-full py-3 rounded-2xl bg-white border border-[#E8EDE9] text-[#6B756C] hover:text-red-600 hover:border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset & Start New Plan Questionnaire</span>
        </button>
      </div>

      {/* App Version, Legal Links & Company Attribution */}
      <div className="pt-3 pb-2 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 text-xs text-[#6B756C]">
          <button
            onClick={() => {
              window.history.pushState({}, '', '/privacy');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-[#2C854E] hover:underline font-bold"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/terms');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-[#2C854E] hover:underline font-bold"
          >
            Terms of Service
          </button>
        </div>

        <p className="text-[11px] text-[#6B756C]">
          NutriPlan SA v2.4 • Built for South Africa
        </p>
        <p className="text-xs text-[#6B756C]">
          A product of{' '}
          <a
            href="https://www.thabosystems.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2C854E] hover:text-[#3FAE68] font-bold hover:underline transition"
          >
            Thabo Systems
          </a>
        </p>
      </div>
    </div>
  );
};
