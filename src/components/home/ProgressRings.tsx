import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Droplets, Utensils, CheckCircle2 } from 'lucide-react';
import { formatWater } from '../../utils/formatters';

export const ProgressRings: React.FC = () => {
  const { userProfile, todayWaterMl, weeklyPlan, habits } = useApp();

  const currentDay = weeklyPlan[0]; // Monday
  const eatenMealsCount = currentDay ? currentDay.meals.filter(m => m.isEaten).length : 0;
  const totalMealsPlanned = currentDay ? currentDay.meals.length : 2;

  const completedHabitsCount = habits.filter(h => h.isCompletedToday).length;
  const totalHabits = habits.length;

  const waterTargetMl = userProfile.dailyWaterTargetLiters * 1000;
  const waterPct = Math.min(100, Math.round((todayWaterMl / waterTargetMl) * 100));
  const mealsPct = Math.min(100, Math.round((eatenMealsCount / totalMealsPlanned) * 100));
  const habitsPct = Math.min(100, Math.round((completedHabitsCount / totalHabits) * 100));

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-[#17211B]">Today's Overview</h3>
          <p className="text-[11px] text-[#6B756C]">Consistent small choices compound</p>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#3FAE68]">
          On Track
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Water Ring Card */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
          <div className="relative w-14 h-14 flex items-center justify-center mb-2">
            <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E8EDE9]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#3FAE68] transition-all duration-500 ease-out"
                strokeDasharray={`${waterPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-[#3FAE68]" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#6B756C] uppercase tracking-wider">Water</span>
          <span className="text-xs font-extrabold text-[#17211B] mt-0.5">{formatWater(todayWaterMl)}</span>
          <span className="text-[10px] text-[#6B756C]">of {userProfile.dailyWaterTargetLiters}L</span>
        </div>

        {/* Meals Ring Card */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
          <div className="relative w-14 h-14 flex items-center justify-center mb-2">
            <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E8EDE9]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#F2A65A] transition-all duration-500 ease-out"
                strokeDasharray={`${mealsPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-[#F2A65A]" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#6B756C] uppercase tracking-wider">Meals</span>
          <span className="text-xs font-extrabold text-[#17211B] mt-0.5">{eatenMealsCount}/{totalMealsPlanned}</span>
          <span className="text-[10px] text-[#6B756C]">planned</span>
        </div>

        {/* Habits Ring Card */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
          <div className="relative w-14 h-14 flex items-center justify-center mb-2">
            <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E8EDE9]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#3FAE68] transition-all duration-500 ease-out"
                strokeDasharray={`${habitsPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#3FAE68]" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#6B756C] uppercase tracking-wider">Habits</span>
          <span className="text-xs font-extrabold text-[#17211B] mt-0.5">{completedHabitsCount}/{totalHabits}</span>
          <span className="text-[10px] text-[#6B756C]">completed</span>
        </div>
      </div>
    </div>
  );
};
