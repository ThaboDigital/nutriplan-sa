import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, MainGoal, DietaryPreference, BudgetTier } from '../../types';
import { generatePersonalizedMealPlan } from '../../services/mealPlannerService';
import { X, ArrowRight, ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingWizard: React.FC = () => {
  const { showOnboardingWizard, setShowOnboardingWizard, updateUserProfile, setWeeklyPlan, showToast } = useApp();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: 'Thabo',
    age: 34,
    sex: 'male',
    heightCm: 178,
    weightKg: 89.5,
    targetWeightKg: 82.0,
    waistCm: 96,
    activityLevel: 'moderately_active',
    mainGoal: 'lose_weight',
    mealsPerDay: 2,
    preferredEatingTimes: ['12:00', '19:00'],
    dietaryPreference: 'lower_carb',
    allergies: [],
    foodsDisliked: [],
    foodsAvoided: ['Pap', 'Bread', 'Rice', 'Potatoes'],
    cookingSkill: 'intermediate',
    cookingTimeMinutes: 25,
    householdSize: 2,
    weeklyBudget: 'R750',
    trackCalories: true,
    dailyWaterTargetLiters: 2.0,
  });

  if (!showOnboardingWizard) return null;

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const finishOnboarding = () => {
    const fullProfile = {
      ...formData,
      calorieTargetKcal: 1750,
      proteinTargetGrams: 115,
      carbsTargetGrams: 65,
      fatsTargetGrams: 85,
      onboardingCompleted: true,
    } as UserProfile;

    updateUserProfile(fullProfile);
    const newPlan = generatePersonalizedMealPlan(fullProfile);
    setWeeklyPlan(newPlan);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setShowOnboardingWizard(false);
    showToast('Your personalized 7-day plan is ready!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Header */}
        <div className="p-4 bg-[#17211B] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-[#3FAE68] uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
            <h3 className="font-extrabold text-base">Plan Setup</h3>
          </div>
          <button
            onClick={() => setShowOnboardingWizard(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1.5 bg-[#E8EDE9]">
          <div
            className="h-full bg-[#3FAE68] transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Form Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* STEP 1: Personal Basics */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="font-black text-lg text-[#17211B]">What should we call you?</h4>
                <p className="text-xs text-[#6B756C]">We will personalize your daily nutrition command centre.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#17211B] block mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Thabo, Lerato, David"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#17211B] block mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg || ''}
                    onChange={e => setFormData({ ...formData, weightKg: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#17211B] block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm || ''}
                    onChange={e => setFormData({ ...formData, heightCm: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none focus:border-[#3FAE68]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Main Goal */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="font-black text-lg text-[#17211B]">What is your primary focus?</h4>
                <p className="text-xs text-[#6B756C]">We�ll adapt calories and protein to fit your lifestyle.</p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'lose_weight', label: 'Lose excess weight steadily', desc: 'Manageable calorie deficit with high satiety' },
                  { id: 'eat_healthier', label: 'Eat healthier & consistent meals', desc: 'Focus on whole South African ingredients' },
                  { id: 'gain_muscle', label: 'Build strength & muscle', desc: 'Higher clean protein portions' },
                  { id: 'improve_energy', label: 'Improve daily energy', desc: 'Avoid heavy starch crashes during working hours' },
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setFormData({ ...formData, mainGoal: item.id as MainGoal })}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      formData.mainGoal === item.id
                        ? 'bg-[#EAF7EF] border-[#3FAE68] text-[#17211B]'
                        : 'bg-white border-[#E8EDE9] hover:border-[#17211B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">{item.label}</span>
                      {formData.mainGoal === item.id && <Check className="w-4 h-4 text-[#3FAE68]" />}
                    </div>
                    <p className="text-[11px] text-[#6B756C] mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Meal Structure & Timing */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="font-black text-lg text-[#17211B]">Meals per day</h4>
                <p className="text-xs text-[#6B756C]">Choose the routine that fits your actual schedule.</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    onClick={() => setFormData({
                      ...formData,
                      mealsPerDay: count as any,
                      preferredEatingTimes: count === 2 ? ['12:00', '19:00'] : count === 3 ? ['08:00', '13:00', '19:00'] : ['08:00', '12:00', '16:00', '19:30']
                    })}
                    className={`py-4 rounded-2xl border font-black text-center transition ${
                      formData.mealsPerDay === count
                        ? 'bg-[#17211B] text-white border-[#17211B]'
                        : 'bg-white text-[#17211B] border-[#E8EDE9] hover:border-[#17211B]'
                    }`}
                  >
                    <span className="text-xl block">{count}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Meals</span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1] text-xs">
                <span className="font-bold text-[#17211B] block">Scheduled Times:</span>
                <p className="text-[#6B756C] mt-0.5">
                  {formData.preferredEatingTimes?.join(' and ')}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Dietary Preferences & Starch Swaps */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="font-black text-lg text-[#17211B]">Dietary Style & Avoidances</h4>
                <p className="text-xs text-[#6B756C]">Customized for South African food preferences.</p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'lower_carb', label: 'Balanced Lower-Carb (Recommended)', desc: 'Swaps heavy pap, bread & potatoes for spinach, cauliflower & cabbage' },
                  { id: 'balanced', label: 'Standard Balanced', desc: 'Moderate portions of wholesome grains & legumes' },
                  { id: 'high_protein', label: 'High Protein', desc: 'Focus on chicken, hake, lean mince & eggs' },
                ].map(d => (
                  <div
                    key={d.id}
                    onClick={() => setFormData({ ...formData, dietaryPreference: d.id as DietaryPreference })}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      formData.dietaryPreference === d.id
                        ? 'bg-[#EAF7EF] border-[#3FAE68] text-[#17211B]'
                        : 'bg-white border-[#E8EDE9] hover:border-[#17211B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">{d.label}</span>
                      {formData.dietaryPreference === d.id && <Check className="w-4 h-4 text-[#3FAE68]" />}
                    </div>
                    <p className="text-[11px] text-[#6B756C] mt-0.5">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Budget & Confirmation */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="font-black text-lg text-[#17211B]">Weekly Grocery Budget</h4>
                <p className="text-xs text-[#6B756C]">We�ll prioritize ingredients that keep groceries affordable.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {(['R500', 'R750', 'R1000', 'R1500'] as BudgetTier[]).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setFormData({ ...formData, weeklyBudget: tier })}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs transition ${
                      formData.weeklyBudget === tier
                        ? 'bg-[#3FAE68] text-white border-[#3FAE68]'
                        : 'bg-white text-[#17211B] border-[#E8EDE9] hover:border-[#17211B]'
                    }`}
                  >
                    {tier} / week
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF7EF] border border-[#3FAE68]/20 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#2C854E]">
                  <CheckCircle2 className="w-4 h-4 text-[#3FAE68]" />
                  <span>Your personalized plan is ready!</span>
                </div>
                <p className="text-xs text-[#2C854E]/80 leading-relaxed">
                  Click below to generate your tailored 7-day South African meal plan and synchronized shopping list.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#E8EDE9] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B756C] hover:text-[#17211B] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <span>{step === totalSteps ? 'Generate Plan' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
