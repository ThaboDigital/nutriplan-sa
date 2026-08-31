import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Shield, Sliders, Bell, RotateCcw, Droplets, Target, AlertCircle, Trash2 } from 'lucide-react';
import { formatCalories } from '../../utils/formatters';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    resetToDemo,
    setShowOnboardingWizard,
    notificationPreferences,
    updateNotificationPreferences,
    showToast
  } = useApp();

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
    <div className="space-y-4 pb-24 px-4 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#17211B] tracking-tight">Profile & Goals</h1>
          <p className="text-xs font-medium text-[#6B756C]">Personalized nutrition settings</p>
        </div>

        <button
          onClick={() => setShowOnboardingWizard(true)}
          className="px-3 py-1.5 rounded-full bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/20 text-xs font-bold transition active:scale-95"
        >
          Re-run Onboarding
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#17211B] text-white flex items-center justify-center font-black text-xl shadow-sm">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-black text-[#17211B]">{userProfile.name}</h2>
            <p className="text-xs text-[#6B756C]">
              {userProfile.age} yrs � {userProfile.heightCm} cm � South Africa
            </p>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2C854E] mt-1">
              Goal: {userProfile.mainGoal.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#F0F2F0]">
          <div className="p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
            <span className="text-[10px] font-bold text-[#6B756C] block">Weight</span>
            {isEditingWeight ? (
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="number"
                  value={tempWeight}
                  onChange={e => setTempWeight(e.target.value)}
                  className="w-14 text-xs font-black border rounded px-1"
                />
                <button onClick={handleSaveWeight} className="text-[#3FAE68] text-xs font-bold">?</button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingWeight(true)}
                className="text-sm font-black text-[#17211B] mt-0.5 cursor-pointer hover:text-[#3FAE68]"
              >
                {userProfile.weightKg} kg
              </div>
            )}
            <span className="text-[9px] text-[#6B756C]">Target: {userProfile.targetWeightKg}kg</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
            <span className="text-[10px] font-bold text-[#6B756C] block">Meals / Day</span>
            <span className="text-sm font-black text-[#17211B] mt-0.5 block">
              {userProfile.mealsPerDay} Meals
            </span>
            <span className="text-[9px] text-[#6B756C]">{userProfile.preferredEatingTimes.join(', ')}</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
            <span className="text-[10px] font-bold text-[#6B756C] block">Daily Water</span>
            <span className="text-sm font-black text-[#3FAE68] mt-0.5 block">
              {userProfile.dailyWaterTargetLiters} L
            </span>
            <span className="text-[9px] text-[#6B756C]">Target</span>
          </div>
        </div>
      </div>

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
    </div>
  );
};
