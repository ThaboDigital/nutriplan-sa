import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, TrendingDown, Droplets, Calendar, Award, Lock, ArrowRight } from 'lucide-react';
import { formatWater } from '../../utils/formatters';

export const ProgressDashboard: React.FC = () => {
  const { userProfile, milestones, setIsWeeklyReviewOpen, authUser, openAuthModal } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Realistic mock data points
  const weightData7d = [
    { day: 'Mon', weight: 90.1, date: '25 Aug' },
    { day: 'Tue', weight: 90.0, date: '26 Aug' },
    { day: 'Wed', weight: 89.8, date: '27 Aug' },
    { day: 'Thu', weight: 89.9, date: '28 Aug' },
    { day: 'Fri', weight: 89.6, date: '29 Aug' },
    { day: 'Sat', weight: 89.5, date: '30 Aug' },
    { day: 'Sun', weight: 89.5, date: '31 Aug' },
  ];

  return (
    <div className="space-y-4 pb-24 px-4 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#17211B] tracking-tight">Your Progress</h1>
          <p className="text-xs font-medium text-[#6B756C]">Sustainable health over quick fixes</p>
        </div>

        <button
          onClick={() => setIsWeeklyReviewOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#17211B] text-white text-xs font-bold shadow-xs hover:bg-black transition active:scale-95"
        >
          <Award className="w-3.5 h-3.5 text-[#3FAE68]" />
          <span>Week in Review</span>
        </button>
      </div>

      {/* Primary Metric: Weight & Waist Trend */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756C]">Current Weight</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-[#17211B] tracking-tight">
                {userProfile.weightKg} kg
              </span>
              <span className="text-xs font-bold text-[#3FAE68] flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> -2.5 kg total
              </span>
            </div>
            <p className="text-[11px] text-[#6B756C] mt-0.5">
              Target: <strong className="text-[#17211B]">{userProfile.targetWeightKg} kg</strong>
            </p>
          </div>

          {/* Time Filter */}
          <div className="flex bg-[#F8F9FA] p-1 rounded-xl border border-[#E8EDE9]">
            {(['7d', '30d', '90d'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                  timeRange === t
                    ? 'bg-white text-[#17211B] shadow-2xs'
                    : 'text-[#6B756C] hover:text-[#17211B]'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Trend Chart (SVG Sparkline) */}
        <div className="py-2 relative">
          <div className="h-28 w-full flex items-end justify-between gap-2 pt-4 px-1">
            {weightData7d.map((pt, idx) => {
              const heightPct = Math.max(15, Math.min(95, ((pt.weight - 89.0) / 1.5) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-bold text-[#6B756C] opacity-0 group-hover:opacity-100 transition">
                    {pt.weight}
                  </span>
                  <div className="w-full bg-[#EAF7EF] rounded-t-lg relative overflow-hidden flex items-end justify-center" style={{ height: `${heightPct}%` }}>
                    <div className="w-full bg-[#3FAE68] rounded-t-lg transition-all duration-500" style={{ height: `${Math.min(100, heightPct + 5)}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#6B756C]">{pt.day}</span>
                </div>
              );
            })}
          </div>

          {/* Soft Registration Gate for Guest Users */}
          {!authUser && (
            <div className="absolute inset-0 -m-2 bg-white/70 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-center z-10 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-[#17211B] text-[#3FAE68] flex items-center justify-center mb-1.5 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-black text-xs text-[#17211B]">Track Your Long-Term Transformation</h4>
              <p className="text-[11px] text-[#6B756C] max-w-xs mt-1 leading-snug">
                You are currently logging daily health metrics in Guest Mode. Create a free account to save your 7-day weight curve, macro averages, and historical trends.
              </p>
              <button
                onClick={() => openAuthModal('register')}
                className="mt-3 px-4 py-2 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Non-scale victories summary */}
        <div className="mt-4 pt-3 border-t border-[#F0F2F0] grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#6B756C] block text-[11px]">Waist Measurement</span>
            <span className="font-extrabold text-[#17211B] text-sm">96 cm (-3 cm)</span>
          </div>
          <div>
            <span className="text-[#6B756C] block text-[11px]">Energy & Satiety</span>
            <span className="font-extrabold text-[#3FAE68] text-sm">High (Lower Carb)</span>
          </div>
        </div>
      </div>

      {/* Habit & Adherence Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-[#E8EDE9] subtle-shadow">
          <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xl font-black text-[#17211B] block">92%</span>
          <span className="text-xs font-bold text-[#17211B] block">Meal Adherence</span>
          <p className="text-[10px] text-[#6B756C] mt-0.5">13 of 14 planned meals eaten</p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#E8EDE9] subtle-shadow">
          <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center mb-2">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="text-xl font-black text-[#17211B] block">10 Days</span>
          <span className="text-xs font-bold text-[#17211B] block">Water Target Met</span>
          <p className="text-[10px] text-[#6B756C] mt-0.5">Current 5-day streak</p>
        </div>
      </div>

      {/* Milestone Cards */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#17211B]">Milestones & Wins</h3>
            <p className="text-[11px] text-[#6B756C]">Celebrating real behavioral consistency</p>
          </div>
          <Trophy className="w-5 h-5 text-[#F2A65A]" />
        </div>

        <div className="space-y-2.5">
          {milestones.map(m => (
            <div
              key={m.id}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                m.isAchieved
                  ? 'bg-[#FBFDFB] border-[#3FAE68]/30'
                  : 'bg-[#F8F9FA] border-[#E8EDE9] opacity-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                m.isAchieved ? 'bg-[#3FAE68] text-white shadow-xs' : 'bg-gray-200 text-gray-400'
              }`}>
                <Award className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#17211B] truncate">{m.title}</h4>
                  {m.achievedDate && (
                    <span className="text-[10px] text-[#3FAE68] font-bold">{m.achievedDate}</span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B756C] line-clamp-1 mt-0.5">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Android Health Connect Integration Notice */}
      <div className="bg-[#F8FBF9] rounded-3xl p-4 border border-[#EAF7EF] flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-[#17211B] block">Android Health Connect</span>
          <span className="text-[11px] text-[#6B756C]">Ready to sync steps, active minutes & weight</span>
        </div>
        <button
          onClick={() => alert('Health Connect integration ready: In native Android build, connects via HealthConnectClient.')}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E8EDE9] text-[#17211B] font-bold text-xs shadow-2xs hover:bg-[#EAF7EF] transition"
        >
          Connected
        </button>
      </div>
    </div>
  );
};
