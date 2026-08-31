import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Bell, ShoppingBag, PackageOpen, Check, X } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    userProfile,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setIsCoachOpen,
    setIsPantryOpen,
    setActiveTab,
    shoppingList,
    authUser,
    openAuthModal
  } = useApp();

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const uncheckedShoppingCount = shoppingList.filter(i => !i.isChecked && !i.isAlreadyHave).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#E8EDE9] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="NutriPlan SA"
            className="w-9 h-9 rounded-xl object-cover shadow-xs border border-[#E8EDE9]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#17211B]">NutriPlan</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EAF7EF] text-[#3FAE68]">
                SA
              </span>
            </div>
            <p className="text-[11px] text-[#6B756C] font-medium leading-none">
              Healthy & Affordable
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* NutriCoach Quick Trigger */}
          <button
            onClick={() => setIsCoachOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d6f0df] transition active:scale-95 text-xs font-bold"
            title="NutriCoach Advisor"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#3FAE68]" />
            <span>NutriCoach</span>
          </button>

          {/* Pantry */}
          <button
            onClick={() => setIsPantryOpen(true)}
            className="p-2 rounded-full text-[#6B756C] hover:text-[#17211B] hover:bg-black/5 transition relative active:scale-95"
            title="My Pantry"
          >
            <PackageOpen className="w-5 h-5" />
          </button>

          {/* Shopping Bag */}
          <button
            onClick={() => setActiveTab('mealplan')}
            className="p-2 rounded-full text-[#6B756C] hover:text-[#17211B] hover:bg-black/5 transition relative active:scale-95"
            title="Shopping List"
          >
            <ShoppingBag className="w-5 h-5" />
            {uncheckedShoppingCount > 0 && (
              <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-[#F2A65A] text-white text-[10px] font-bold flex items-center justify-center">
                {uncheckedShoppingCount > 9 ? '9+' : uncheckedShoppingCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="p-2 rounded-full text-[#6B756C] hover:text-[#17211B] hover:bg-black/5 transition relative active:scale-95"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#3FAE68] ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Guest Mode Status Pill */}
      {!authUser && (
        <div className="max-w-md mx-auto mt-2 pt-2 border-t border-[#E8EDE9]/60 flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#2C854E] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3FAE68] animate-pulse" />
            Guest Mode (Local Storage)
          </span>
          <button
            onClick={() => openAuthModal('register')}
            className="font-black text-[#17211B] bg-white border border-[#3FAE68]/30 px-2.5 py-0.5 rounded-full shadow-2xs hover:bg-[#EAF7EF] transition"
          >
            Register to backup & sync →
          </button>
        </div>
      )}

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
