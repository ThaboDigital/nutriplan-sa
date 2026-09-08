import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Dumbbell, Droplets, CheckCircle2 } from 'lucide-react';
import { formatWater } from '../../utils/formatters';

export const ProgressRings: React.FC = () => {
  const { userProfile, todayWaterMl, habits, getDiarySummary } = useApp();

  const summary = getDiarySummary();

  const completedHabitsCount = habits.filter(h => h.isCompletedToday).length;
  const totalHabits = habits.length;

  const waterTargetMl = (userProfile.dailyWaterTargetLiters || 2.0) * 1000;
  const waterPct = Math.min(100, Math.round((todayWaterMl / waterTargetMl) * 100));
  const caloriePct = summary.calorieTarget > 0 ? Math.min(100, Math.round((summary.caloriesConsumed / summary.calorieTarget) * 100)) : 0;
  const proteinPct = summary.proteinTargetG > 0 ? Math.min(100, Math.round((summary.proteinConsumedG / summary.proteinTargetG) * 100)) : 0;
  const habitsPct = totalHabits > 0 ? Math.min(100, Math.round((completedHabitsCount / totalHabits) * 100)) : 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-[#17211B]">Today's Progress</h3>
          <p className="text-[11px] text-[#6B756C]">Real-time daily balance</p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/30">
          {summary.caloriesRemaining} kcal left
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. Calories Ring Card */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] min-w-0">
          <div className="relative w-12 h-12 flex items-center justify-center mb-1.5">
            <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E8EDE9]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#F2A65A] transition-all duration-500 ease-out"
                strokeDasharray={`${caloriePct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#F2A65A]" />
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider truncate w-full">Calories</span>
          <span className="text-xs font-black text-[#17211B] mt-0.5 truncate w-full">{summary.caloriesConsumed}</span>
          <span className="text-[9px] text-[#6B756C] truncate w-full">of {summary.calorieTarget}</span>
        </div>

        {/* 2. Protein Ring Card */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] min-w-0">
          <div className="relative w-12 h-12 flex items-center justify-center mb-1.5">
            <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E8EDE9]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#3FAE68] transition-all duration-500 ease-out"
                strokeDasharray={`${proteinPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-[#3FAE68]" />
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider truncate w-full">Protein</span>
          <span className="text-xs font-black text-[#17211B] mt-0.5 truncate w-full">{summary.proteinConsumedG}g</span>
          <span className="text-[9px] text-[#6B756C] truncate w-full">of {summary.proteinTargetG}g</span>
        </div>

        {/* 3. Water Ring Card */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] min-w-0">
          <div className="relative w-12 h-12 flex items-center justify-center mb-1.5">
            <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#E8EDE9]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#3B82F6] transition-all duration-500 ease-out"
                strokeDasharray={`${waterPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-[#3B82F6]" />
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider truncate w-full">Water</span>
          <span className="text-xs font-black text-[#17211B] mt-0.5 truncate w-full">{formatWater(todayWaterMl)}</span>
          <span className="text-[9px] text-[#6B756C] truncate w-full">of {userProfile.dailyWaterTargetLiters}L</span>
        </div>

        {/* 4. Habits Ring Card */}
        <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] min-w-0">
          <div className="relative w-12 h-12 flex items-center justify-center mb-1.5">
            <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 36 36">
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
              <CheckCircle2 className="w-4 h-4 text-[#3FAE68]" />
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider truncate w-full">Habits</span>
          <span className="text-xs font-black text-[#17211B] mt-0.5 truncate w-full">{completedHabitsCount}/{totalHabits}</span>
          <span className="text-[9px] text-[#6B756C] truncate w-full">completed</span>
        </div>
      </div>
    </div>
  );
};

