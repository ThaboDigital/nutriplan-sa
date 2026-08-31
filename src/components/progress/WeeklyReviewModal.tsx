import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, TrendingDown, UserCheck, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WeeklyReviewModal: React.FC = () => {
  const { isWeeklyReviewOpen, setIsWeeklyReviewOpen, userProfile, regenerateEntireWeek, showToast } = useApp();

  if (!isWeeklyReviewOpen) return null;

  const handleBuildNextPlan = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
    regenerateEntireWeek();
    setIsWeeklyReviewOpen(false);
    showToast('Next week's customized plan is ready!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Header */}
        <div className="p-5 bg-[#17211B] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-[#3FAE68] uppercase tracking-wider">
              Weekly Health Review
            </span>
            <h3 className="font-black text-lg">Your Week in Review</h3>
            <p className="text-xs text-white/70">Solid consistency, {userProfile.name}!</p>
          </div>
          <button
            onClick={() => setIsWeeklyReviewOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-[#EAF7EF] border border-[#3FAE68]/20">
              <span className="text-[10px] font-bold text-[#2C854E] block uppercase">Meals Planned</span>
              <span className="text-xl font-black text-[#17211B] mt-0.5 block">13 / 14</span>
              <p className="text-[10px] text-[#2C854E]/80 mt-0.5">92% adherence</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1]">
              <span className="text-[10px] font-bold text-[#F2A65A] block uppercase">Water Consistency</span>
              <span className="text-xl font-black text-[#17211B] mt-0.5 block">5 Days</span>
              <p className="text-[10px] text-[#6B756C] mt-0.5">Hit full 2.0L goal</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-[#17211B]">Highlights</h4>

            <div className="p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3FAE68] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#17211B] block">Top Habit: Green Veggies</strong>
                <p className="text-[#6B756C] text-[11px] leading-relaxed">
                  You included cabbage, spinach (morogo), or salad with almost every meal.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] flex items-start gap-2.5">
              <Award className="w-4 h-4 text-[#F2A65A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#17211B] block">Weight Trend</strong>
                <p className="text-[#6B756C] text-[11px] leading-relaxed">
                  Down 0.6 kg this week (89.5 kg). Healthy, steady loss without severe starvation.
                </p>
              </div>
            </div>
          </div>

          {/* NutriCoach Recommendation */}
          <div className="p-4 rounded-2xl bg-[#17211B] text-white space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3FAE68]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>NutriCoach Adaptation for Next Week</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              "You consistently favored the <strong>Chicken Salad</strong> and <strong>Beef Mince & Cabbage</strong> for quick prep. Next week's plan retains these favorites while introducing budget-friendly <strong>Gem Squash & Tuna</strong>."
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#E8EDE9]">
          <button
            onClick={handleBuildNextPlan}
            className="w-full py-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
          >
            <span>Build Next Week's Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
