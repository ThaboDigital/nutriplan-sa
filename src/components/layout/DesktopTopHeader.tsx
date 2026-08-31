import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Plus, Cloud, CloudOff, Check, X } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface DesktopTopHeaderProps {
  onOpenLogin: () => void;
  authUser: { email: string; name: string } | null;
}

export const DesktopTopHeader: React.FC<DesktopTopHeaderProps> = ({
  onOpenLogin,
  authUser
}) => {
  const {
    userProfile,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setIsFoodLogOpen,
    setIsCoachOpen
  } = useApp();

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#E8EDE9] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Info */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-black text-[#17211B]">
          {userProfile.mainGoal.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-[#6B756C]">
          Target: <strong className="text-[#17211B]">{userProfile.targetWeightKg} kg</strong> ({userProfile.mealsPerDay} meals/day)
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-[#6B756C]">
          Budget: <strong className="text-[#3FAE68]">{userProfile.weeklyBudget}</strong>
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Cloud / Guest Status */}
        {authUser ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF7EF] border border-[#3FAE68]/30 text-[11px] font-bold text-[#2C854E]">
            <Cloud className="w-3.5 h-3.5 text-[#3FAE68]" />
            <span>Cloud Synced</span>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF7EF] border border-[#3FAE68]/40 text-[11px] font-extrabold text-[#2C854E] hover:bg-[#d6f0df] transition shadow-2xs"
            title="Register to backup and sync"
          >
            <CloudOff className="w-3.5 h-3.5 text-[#3FAE68]" />
            <span>Guest Mode — Register to backup & sync</span>
          </button>
        )}

        {/* Quick Food Log button */}
        <button
          onClick={() => setIsFoodLogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17211B] text-white hover:bg-black text-xs font-bold transition shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Log Meal</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsModal(!showNotificationsModal)}
            className="p-2 rounded-xl text-[#6B756C] hover:text-[#17211B] hover:bg-black/5 transition relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#3FAE68] ring-2 ring-white" />
            )}
          </button>

          {showNotificationsModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E8EDE9] z-50">
              <div className="p-4 border-b border-[#E8EDE9] flex items-center justify-between bg-[#FFFDF8]">
                <div>
                  <h3 className="font-bold text-xs text-[#17211B]">Notification Centre</h3>
                  <p className="text-[10px] text-[#6B756C]">NutriPlan alerts</p>
                </div>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1 rounded-full hover:bg-black/5 text-[#6B756C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-3 space-y-2">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer text-xs ${
                      n.isRead ? 'bg-white border-[#F0F2F0] opacity-75' : 'bg-[#EAF7EF]/40 border-[#3FAE68]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#17211B] text-[11px]">{n.title}</span>
                      <span className="text-[9px] text-[#6B756C]">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#6B756C] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#F8F9FA] border-t border-[#E8EDE9] flex items-center justify-between">
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-[#3FAE68] font-bold hover:underline flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="text-xs font-semibold text-[#6B756C] hover:text-[#17211B]"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};