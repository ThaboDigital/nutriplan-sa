import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MealCard } from '../home/MealCard';
import { ShoppingListView } from '../shopping/ShoppingListView';
import { Calendar, RotateCw, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { formatCalories, formatProtein, formatZAR } from '../../utils/formatters';

export const MealPlanView: React.FC = () => {
  const {
    weeklyPlan,
    currentDayIndex,
    setCurrentDayIndex,
    userProfile,
    regenerateEntireWeek,
    regenerateSingleDay,
    shoppingList,
    setIsCoachOpen,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'shopping'>('calendar');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  const currentDayPlan = weeklyPlan[currentDayIndex] || weeklyPlan[0];

  const weeklyEstimatedCost = shoppingList.reduce((acc, i) => acc + (i.isAlreadyHave ? 0 : i.estimatedCostZAR), 0);

  return (
    <div className="space-y-6 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#17211B] tracking-tight">Weekly Meal Plan</h1>
          <p className="text-xs sm:text-sm font-medium text-[#6B756C]">7 days of balanced South African meals</p>
        </div>

        {/* View Switcher: Calendar vs Shopping List */}
        <div className="flex bg-[#E8EDE9] p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'calendar'
                ? 'bg-white text-[#17211B] shadow-xs'
                : 'text-[#6B756C] hover:text-[#17211B]'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveSubTab('shopping')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'shopping'
                ? 'bg-white text-[#17211B] shadow-xs'
                : 'text-[#6B756C] hover:text-[#17211B]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Groceries ({shoppingList.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'shopping' ? (
        <ShoppingListView />
      ) : (
        <div className="space-y-6">
          {/* Day Selector Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {days.map((day, idx) => {
              const isSelected = currentDayIndex === idx;
              const shortDay = day.slice(0, 3);
              const dayMeals = weeklyPlan[idx]?.meals || [];
              const allEaten = dayMeals.length > 0 && dayMeals.every(m => m.isEaten);

              return (
                <button
                  key={day}
                  onClick={() => setCurrentDayIndex(idx)}
                  className={`flex flex-col items-center justify-center min-w-[64px] sm:min-w-[80px] py-3 px-3 rounded-2xl transition-all active:scale-95 shrink-0 ${
                    isSelected
                      ? 'bg-[#17211B] text-white shadow-md'
                      : 'bg-white text-[#6B756C] border border-[#E8EDE9] hover:border-[#17211B]'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{shortDay}</span>
                  <span className={`text-sm sm:text-base font-black mt-0.5 ${isSelected ? 'text-[#3FAE68]' : 'text-[#17211B]'}`}>
                    {idx + 1}
                  </span>
                  {allEaten && (
                    <span className="w-2 h-2 rounded-full bg-[#3FAE68] mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Daily Nutrition & Budget Bar */}
          <div className="bg-[#EAF7EF] rounded-3xl p-4 border border-[#3FAE68]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-sm text-[#2C854E] block">{currentDayPlan.dayOfWeek} Target</span>
              <span className="text-xs text-[#2C854E]/80">
                {userProfile.trackCalories ? formatCalories(currentDayPlan.totalCalories) + ' • ' : ''}
                {formatProtein(currentDayPlan.totalProteinG)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => regenerateSingleDay(currentDayPlan.dayOfWeek)}
                className="px-3.5 py-2 rounded-xl bg-white text-[#2C854E] hover:bg-[#d4edd9] font-bold text-xs shadow-2xs flex items-center gap-1.5 transition"
                title="Regenerate this day only"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rethink Day</span>
              </button>
            </div>
          </div>

          {/* Meals for Selected Day: 1 column on mobile, 2 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentDayPlan.meals.map(meal => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>

          {/* Weekly Management Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8EDE9] subtle-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-base text-[#17211B]">Full Week Optimization</h4>
                <p className="text-xs text-[#6B756C] mt-0.5">
                  Estimated grocery cost: <strong className="text-[#17211B]">{formatZAR(weeklyEstimatedCost)}</strong> (Target: {userProfile.weeklyBudget})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={regenerateEntireWeek}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#FFFDF8] border border-[#E8EDE9] hover:border-[#17211B] text-xs font-bold text-[#17211B] transition active:scale-95"
              >
                <RotateCw className="w-4 h-4 text-[#3FAE68]" />
                <span>Re-roll 7-Day Plan</span>
              </button>

              <button
                onClick={() => setIsCoachOpen(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#17211B] text-white hover:bg-black text-xs font-bold transition active:scale-95 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#3FAE68]" />
                <span>Ask NutriCoach to Adjust Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};