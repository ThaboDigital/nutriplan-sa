import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressRings } from './ProgressRings';
import { WaterWidget } from './WaterWidget';
import { MealCard } from './MealCard';
import { UserCheck, ClipboardList, Calendar, ArrowRight, CheckCircle2, Circle, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { formatZAR } from '../../utils/formatters';

export const HomeDashboard: React.FC = () => {
  const {
    userProfile,
    weeklyPlan,
    habits,
    toggleHabit,
    setIsCoachOpen,
    setActiveTab,
    setShowOnboardingWizard
  } = useApp();

  const currentDay = weeklyPlan[0]; // Monday
  const todayMeals = currentDay ? currentDay.meals : [];

  // Greeting based on time of day
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17) timeGreeting = 'Good evening';

  return (
    <div className="space-y-6 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner Greeting & Quick Action Triggers */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-black text-[#17211B] tracking-tight">
              {timeGreeting}, {userProfile.name}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#6B756C] mt-0.5">
              Let's make today a healthy, energized one.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 shrink-0 mt-1 sm:mt-0">
            <button
              onClick={() => setShowOnboardingWizard(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl bg-[#17211B] text-white text-xs font-bold shadow-xs active:scale-95 transition hover:bg-black text-center"
            >
              <ClipboardList className="w-4 h-4 text-[#3FAE68] shrink-0" />
              <span className="truncate">Personalize Plan</span>
            </button>

            <button
              onClick={() => setIsCoachOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl bg-[#EAF7EF] border border-[#3FAE68]/20 text-[#2C854E] text-xs font-bold shadow-xs active:scale-95 transition hover:bg-[#d5eedf] text-center"
            >
              <UserCheck className="w-4 h-4 text-[#3FAE68] shrink-0" />
              <span className="truncate">NutriCoach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Welcome & Health Questionnaire Hero Card (Only shown for new visitors who have not completed onboarding yet) */}
      {!userProfile.onboardingCompleted && (
        <div className="bg-gradient-to-r from-[#17211B] via-[#1E2E25] to-[#25392D] rounded-3xl p-5 sm:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-[#3FAE68]/30 relative overflow-hidden animate-in fade-in">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#3FAE68] text-white text-[10px] font-black uppercase tracking-wider">
                Health Questionnaire
              </span>
              <span className="text-xs text-white/70">Customized for South African Foods</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Set Your Age, Weight & Goal Preferences
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Take our 1-minute questionnaire to set your personal weight targets, meal timings, affordable grocery budget (in ZAR), and smart starch swaps.
            </p>
          </div>

          <div className="z-10 w-full md:w-auto shrink-0 flex items-center gap-2">
            <button
              onClick={() => setShowOnboardingWizard(true)}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Start Questionnaire</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Responsive Grid: Mobile 1 column, Desktop 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Column 1: Daily Overview Rings & Hydration (Desktop: 4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <ProgressRings />
          <WaterWidget />
        </div>

        {/* Column 2: Today's Planned Meals (Desktop: 5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#17211B]">Today’s Meals</h2>
              <p className="text-xs text-[#6B756C]">
                {userProfile.mealsPerDay} meals planned for optimal energy
              </p>
            </div>

            <button
              onClick={() => setActiveTab('mealplan')}
              className="text-xs font-bold text-[#3FAE68] hover:text-[#2C854E] flex items-center gap-1 transition"
            >
              <span>Full week</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayMeals.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 text-center border border-[#E8EDE9] subtle-shadow">
              <UtensilsCrossed className="w-10 h-10 text-[#6B756C] mx-auto mb-2 opacity-50" />
              <h3 className="font-bold text-sm text-[#17211B]">No meals planned for today</h3>
              <p className="text-xs text-[#6B756C] mt-1 mb-4">Let’s build your first healthy week.</p>
              <button
                onClick={() => setShowOnboardingWizard(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#3FAE68] text-white text-xs font-bold shadow-sm hover:bg-[#349859] transition"
              >
                Create My Plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayMeals.map(meal => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Daily Healthy Habits & Safety (Desktop: 3 cols) */}
        <div className="md:col-span-3 space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#17211B]">Daily Habits</h3>
                <p className="text-[11px] text-[#6B756C]">Small daily wins build results</p>
              </div>
              <button
                onClick={() => setActiveTab('progress')}
                className="text-xs font-bold text-[#3FAE68] hover:underline"
              >
                Streaks
              </button>
            </div>

            <div className="space-y-2.5">
              {habits.slice(0, 5).map(habit => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer active:scale-98 ${
                    habit.isCompletedToday
                      ? 'bg-[#EAF7EF]/50 border-[#3FAE68]/30 text-[#17211B]'
                      : 'bg-[#FFFDF8] border-[#F0EBE1] hover:border-[#E8EDE9]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition ${
                      habit.isCompletedToday ? 'text-[#3FAE68]' : 'text-[#6B756C]'
                    }`}>
                      {habit.isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5 fill-current" />
                      ) : (
                        <Circle className="w-5 h-5 stroke-[1.8]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-xs font-bold block truncate ${habit.isCompletedToday ? 'line-through text-[#6B756C]' : 'text-[#17211B]'}`}>
                        {habit.title}
                      </span>
                      <p className="text-[10px] text-[#6B756C] line-clamp-1">{habit.description}</p>
                    </div>
                  </div>

                  {habit.currentStreak > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-[#E8EDE9] text-[#17211B] shrink-0 ml-1">
                      🔥 {habit.currentStreak}d
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Wellness & Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1] text-[11px] text-[#6B756C] leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#F2A65A] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#17211B]">Wellness Note:</strong> NutriPlan SA provides balanced nutrition information and is not a medical diagnosis tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};