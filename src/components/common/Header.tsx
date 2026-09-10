import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Bell, Check, X } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setIsCoachOpen,
    setActiveTab,
    authUser,
    openAuthModal,
  } = useApp();

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const effectiveUser = authUser || (() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nutriplan_auth_user') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.isGuest && parsed.email) return parsed;
      } catch (e) {}
    }
    return null;
  })();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E8EDE9] px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Status Chip (Left) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 active:scale-95 transition focus:outline-none"
            title="NutriPlan SA Home"
          >
            <img
              src="/logo.png"
              alt="NutriPlan SA"
              className="w-8 h-8 rounded-xl object-cover shadow-xs border border-[#E8EDE9]"
            />
          </button>
          {!effectiveUser ? (
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[10px] font-extrabold text-[#2C854E] border border-[#3FAE68]/20 hover:bg-[#d5eedf] transition active:scale-95"
              title="Tap to Sign In"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3FAE68] animate-pulse" />
              Sign In
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[10px] font-bold text-[#2C854E] border border-[#3FAE68]/20 max-w-[110px] truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3FAE68]" />
              <span className="truncate">{effectiveUser.name.split(' ')[0]}</span>
            </span>
          )}
        </div>

        {/* Action icons (Right) - Streamlined for mobile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* NutriCoach (Prominent AI Assistant launcher) */}
          <button
            onClick={() => setIsCoachOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d6f0df] transition active:scale-95 text-xs font-black border border-[#3FAE68]/30 shadow-2xs"
            title="NutriCoach AI Advisor"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#3FAE68]" />
            <span className="text-xs font-bold">AI Coach</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6B756C] hover:text-[#17211B] hover:bg-black/5 transition relative active:scale-95"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#3FAE68] ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Avatar on Mobile */}
          {effectiveUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full bg-[#17211B] text-white flex items-center justify-center text-xs font-black ring-2 ring-[#3FAE68]/30 hover:ring-[#3FAE68] transition active:scale-95 shrink-0"
              title={`Signed in as ${effectiveUser.name} • View Profile & Sign Out`}
            >
              {effectiveUser.name ? effectiveUser.name.charAt(0).toUpperCase() : 'U'}
            </button>
          )}
        </div>
      </div>

      {/* Notifications Drawer Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl mt-12 border border-[#E8EDE9]">
            <div className="p-4 border-b border-[#E8EDE9] flex items-center justify-between bg-[#FFFDF8]">
              <div>
                <h3 className="font-bold text-[#17211B] text-base">Notification Centre</h3>
                <p className="text-xs text-[#6B756C]">Gentle reminders and updates</p>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#6B756C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    n.isRead ? 'bg-white border-[#F0F2F0] opacity-75' : 'bg-[#EAF7EF]/40 border-[#3FAE68]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#17211B]">{n.title}</span>
                    <span className="text-[10px] text-[#6B756C]">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#6B756C] leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#F8F9FA] border-t border-[#E8EDE9] flex items-center justify-between">
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#3FAE68] font-semibold hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-xs font-medium text-[#6B756C] px-3 py-1.5 rounded-lg hover:bg-black/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
