import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  UtensilsCrossed,
  Droplets,
  Sparkles,
} from 'lucide-react';
import { MealCategory, FoodLogEntry } from '../../types';
import { MacroBar } from '../common/DesignSystem';

export const FoodDiaryView: React.FC = () => {
  const {
    userProfile,
    foodLog,
    removeFoodLogEntry,
    selectedDiaryDate,
    setSelectedDiaryDate,
    openFoodLogForMeal,
    getDiarySummary,
    todayWaterMl,
    addWaterMl,
    setIsCoachOpen,
  } = useApp();

  const summary = getDiarySummary(selectedDiaryDate);

  // Date manipulation helpers
  const todayStr = new Date().toISOString().split('T')[0];

  const handleDateChange = (daysDelta: number) => {
    const current = new Date(selectedDiaryDate);
    current.setDate(current.getDate() + daysDelta);
    setSelectedDiaryDate(current.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const d = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return d.toLocaleDateString('en-ZA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const meals: { type: MealCategory; label: string; timeHint: string }[] = [
    { type: 'breakfast', label: 'Breakfast', timeHint: '07:00 - 09:00' },
    { type: 'lunch', label: 'Lunch', timeHint: '12:00 - 14:00' },
    { type: 'dinner', label: 'Dinner', timeHint: '18:30 - 20:30' },
    { type: 'snack', label: 'Snacks & Drinks', timeHint: 'Anytime' },
  ];

  const getEntriesForMeal = (mealType: MealCategory) => {
    return foodLog.filter(e => e.date === selectedDiaryDate && e.mealType === mealType);
  };

  const getMealTotalKcal = (entries: FoodLogEntry[]) => {
    return entries.reduce((sum, e) => sum + e.calories, 0);
  };

  const getMealTotalProtein = (entries: FoodLogEntry[]) => {
    return Math.round(entries.reduce((sum, e) => sum + e.proteinG, 0));
  };

  const caloriePct = summary.calorieTarget > 0
    ? Math.min(100, Math.round((summary.caloriesConsumed / summary.calorieTarget) * 100))
    : 0;

  return (
    <div className="space-y-5 pb-28 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* 1. Top Date Stepper Bar */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#17211B] tracking-tight truncate">Food Diary</h1>
          <p className="text-xs text-[#6B756C] font-medium hidden sm:block">Fast, frictionless nutrition tracking</p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-1 bg-white border border-[#E8EDE9] rounded-2xl p-1 subtle-shadow shrink-0">
          <button
            onClick={() => handleDateChange(-1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#6B756C] hover:text-[#17211B] hover:bg-[#F8F9FA] transition active:scale-95"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDiaryDate(todayStr)}
            className="px-2.5 py-1 text-xs font-black text-[#17211B] hover:text-[#3FAE68] transition"
          >
            {formatDateDisplay(selectedDiaryDate)}
          </button>

          <button
            onClick={() => handleDateChange(1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#6B756C] hover:text-[#17211B] hover:bg-[#F8F9FA] transition active:scale-95"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Compact Daily Nutrition Summary (Section 9) */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8EDE9] subtle-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0F2F0] pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-black text-[#6B756C] uppercase tracking-wider">Calories</span>
            <span className="text-2xl sm:text-3xl font-black text-[#17211B] tracking-tight">
              {summary.caloriesConsumed}
            </span>
            <span className="text-xs font-semibold text-[#6B756C]">
              / {summary.calorieTarget} kcal
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B756C] block">Remaining</span>
            <span className={`text-sm sm:text-base font-black ${
              summary.caloriesRemaining < 200 ? 'text-[#F2A65A]' : 'text-[#3FAE68]'
            }`}>
              {summary.caloriesRemaining} kcal
            </span>
          </div>
        </div>

        {/* Calories Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#F0F2F0] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              caloriePct > 100 ? 'bg-[#EF4444]' : 'bg-[#3FAE68]'
            }`}
            style={{ width: `${Math.min(100, caloriePct)}%` }}
          />
        </div>

        {/* Macronutrient Bars */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          <MacroBar
            label="Protein"
            current={summary.proteinConsumedG}
            target={summary.proteinTargetG}
            color="green"
            unit="g"
          />
          <MacroBar
            label="Carbs"
            current={summary.carbsConsumedG}
            target={summary.carbsTargetG}
            color="amber"
            unit="g"
          />
          <MacroBar
            label="Fat"
            current={summary.fatConsumedG}
            target={summary.fatTargetG}
            color="slate"
            unit="g"
          />
        </div>
      </div>

      {/* 3. Meal Sections (Section 7) */}
      <div className="space-y-4">
        {meals.map(m => {
          const entries = getEntriesForMeal(m.type);
          const mealKcal = getMealTotalKcal(entries);
          const mealProtein = getMealTotalProtein(entries);

          return (
            <div
              key={m.type}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8EDE9] subtle-shadow space-y-3"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between border-b border-[#F0F2F0] pb-2.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#EAF7EF] text-[#2C854E] flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#17211B] truncate">{m.label}</h3>
                    <span className="text-[10px] text-[#6B756C] hidden sm:inline">{m.timeHint}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {entries.length > 0 && (
                    <div className="text-right">
                      <span className="text-xs font-black text-[#17211B] block">
                        {mealKcal} kcal
                      </span>
                      <span className="text-[10px] font-bold text-[#3FAE68]">
                        {mealProtein}g P
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => openFoodLogForMeal(m.type)}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d8f1e1] text-xs font-bold transition active:scale-95 border border-[#3FAE68]/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Logged Entries for this meal */}
              {entries.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-[#6B756C]">No food logged for {m.label} yet.</p>
                  <button
                    onClick={() => openFoodLogForMeal(m.type)}
                    className="mt-1 text-xs font-extrabold text-[#3FAE68] hover:underline"
                  >
                    + Tap to add first food
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map(entry => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] hover:border-[#3FAE68]/40 transition group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#17211B] truncate">
                            {entry.foodName}
                          </span>
                          {entry.isRecipe && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-[#EAF7EF] text-[#2C854E]">
                              Recipe
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#6B756C] mt-0.5 font-medium">
                          <span>Qty: {entry.servingQuantity} ({entry.servingUnit})</span>
                          <span>•</span>
                          <span className="text-[#3FAE68] font-bold">{entry.proteinG}g protein</span>
                          <span>•</span>
                          <span>{entry.carbsG}g C</span>
                          <span>•</span>
                          <span>{entry.fatG}g F</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs sm:text-sm font-black text-[#17211B]">
                          {entry.calories} kcal
                        </span>
                        <button
                          onClick={() => removeFoodLogEntry(entry.id)}
                          className="p-1.5 rounded-xl text-[#6B756C] hover:text-red-600 hover:bg-red-50 transition"
                          title="Remove food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Quick Water Logging Widget in Diary */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8EDE9] subtle-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#17211B]">Hydration Tracker</h4>
            <p className="text-xs text-[#6B756C]">
              {todayWaterMl} / {(userProfile.dailyWaterTargetLiters || 2.0) * 1000} ml logged today
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addWaterMl(250)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#F8F9FA] hover:bg-[#EAF7EF] border border-[#E8EDE9] text-xs font-extrabold text-[#17211B] transition active:scale-95"
          >
            +250 ml (Cup)
          </button>
          <button
            onClick={() => addWaterMl(500)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#3FAE68] hover:bg-[#349859] text-white text-xs font-black transition active:scale-95 shadow-xs"
          >
            +500 ml (Bottle)
          </button>
        </div>
      </div>

      {/* 5. AI Coach Context Banner */}
      <div className="bg-gradient-to-r from-[#17211B] to-[#25392D] rounded-3xl p-4 sm:p-5 text-white flex items-center justify-between gap-3 shadow-md">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#3FAE68]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NutriCoach Diary Insight</span>
          </div>
          <p className="text-xs text-white/80 max-w-md leading-relaxed">
            Need help balancing dinner macros or swapping for an affordable South African option?
          </p>
        </div>

        <button
          onClick={() => setIsCoachOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] text-xs font-black shrink-0 transition active:scale-95 shadow-sm"
        >
          Ask Coach
        </button>
      </div>
    </div>
  );
};
