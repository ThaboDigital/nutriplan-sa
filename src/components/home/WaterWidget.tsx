import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Droplets, Plus, RotateCcw, Settings2 } from 'lucide-react';
import { formatWater } from '../../utils/formatters';

export const WaterWidget: React.FC = () => {
  const {
    todayWaterMl,
    addWaterMl,
    resetWaterToday,
    userProfile,
    notificationPreferences,
    updateNotificationPreferences,
    showToast
  } = useApp();

  const [showConfig, setShowConfig] = useState(false);
  const [customMl, setCustomMl] = useState('300');

  const targetMl = userProfile.dailyWaterTargetLiters * 1000;
  const progressPercent = Math.min(100, Math.round((todayWaterMl / targetMl) * 100));
  const remainingMl = Math.max(0, targetMl - todayWaterMl);

  const requestBrowserNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('?? NutriPlan SA Hydration Alert', {
          body: `You are doing great! ${remainingMl > 0 ? `${remainingMl} ml remaining to hit your ${userProfile.dailyWaterTargetLiters} L target.` : "You have reached your goal!"}`,
          icon: '/favicon.svg'
        });
        showToast('Browser notifications enabled for water reminders!', 'success');
      } else {
        showToast('Notification permission was dismissed', 'warning');
      }
    } else {
      showToast('Notifications not supported in this browser environment', 'info');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow relative overflow-hidden">
      {/* Decorative subtle background wave effect */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-[#EAF7EF]/60 transition-all duration-700 ease-out -z-0 pointer-events-none"
        style={{ height: `${Math.min(100, progressPercent)}%` }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center">
              <Droplets className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17211B]">Hydration</h3>
              <p className="text-[11px] text-[#6B756C]">Clean water & herbal rooibos</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 rounded-lg text-[#6B756C] hover:bg-black/5 transition"
              title="Water reminder settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={resetWaterToday}
              className="p-1.5 rounded-lg text-[#6B756C] hover:bg-black/5 transition"
              title="Reset today's water"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Display */}
        <div className="my-3">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#17211B] tracking-tight">
                {formatWater(todayWaterMl)}
              </span>
              <span className="text-xs font-semibold text-[#6B756C]">
                / {userProfile.dailyWaterTargetLiters} L
              </span>
            </div>
            <span className="text-xs font-bold text-[#3FAE68] bg-[#EAF7EF] px-2 py-0.5 rounded-full">
              {progressPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-[#E8EDE9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3FAE68] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-[#6B756C] mt-1.5">
            {remainingMl > 0
              ? `?? ${remainingMl} ml away from your target for today`
              : '?? Daily hydration goal achieved! Keep sipping!'}
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => addWaterMl(250)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-2xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d8f1e1] active:scale-95 font-bold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>250 ml</span>
          </button>

          <button
            onClick={() => addWaterMl(500)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#36995b] active:scale-95 font-bold text-xs shadow-sm shadow-[#3FAE68]/30 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>500 ml</span>
          </button>

          <div className="flex items-center bg-[#F8F9FA] rounded-2xl border border-[#E8EDE9] px-2">
            <input
              type="number"
              value={customMl}
              onChange={e => setCustomMl(e.target.value)}
              className="w-full text-center text-xs font-bold text-[#17211B] bg-transparent outline-none"
              placeholder="ml"
            />
            <button
              onClick={() => {
                const val = parseInt(customMl);
                if (val > 0) addWaterMl(val);
              }}
              className="text-[#3FAE68] hover:text-[#2C854E] p-1 font-bold text-xs"
            >
              Add
            </button>
          </div>
        </div>

        {/* Config drawer */}
        {showConfig && (
          <div className="mt-4 pt-3 border-t border-[#E8EDE9] space-y-2 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[#17211B] font-medium">Hydration Reminders</span>
              <input
                type="checkbox"
                checked={notificationPreferences.waterReminders}
                onChange={e => updateNotificationPreferences({ waterReminders: e.target.checked })}
                className="rounded text-[#3FAE68] focus:ring-[#3FAE68]"
              />
            </div>

            {notificationPreferences.waterReminders && (
              <div className="space-y-2 pt-1 text-[11px] text-[#6B756C]">
                <div className="flex items-center justify-between">
                  <span>Schedule interval:</span>
                  <span className="font-semibold text-[#17211B]">Every {notificationPreferences.waterIntervalHours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active hours:</span>
                  <span className="font-semibold text-[#17211B]">{notificationPreferences.waterStartTime} - {notificationPreferences.waterEndTime}</span>
                </div>
                <button
                  onClick={requestBrowserNotification}
                  className="w-full py-1.5 mt-1 rounded-xl bg-[#17211B] text-white font-semibold text-center hover:bg-black transition active:scale-98"
                >
                  Test Browser Alert
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
