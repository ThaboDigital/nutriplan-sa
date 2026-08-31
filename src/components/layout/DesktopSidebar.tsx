import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Calendar,
  BookOpen,
  TrendingUp,
  ShoppingBag,
  PackageOpen,
  Sparkles,
  User,
  LogOut,
  LogIn,
  ClipboardList
} from 'lucide-react';

interface DesktopSidebarProps {
  onOpenLogin: () => void;
  authUser: { email: string; name: string } | null;
  onLogout: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  onOpenLogin,
  authUser,
  onLogout
}) => {
  const {
    activeTab,
    setActiveTab,
    setIsCoachOpen,
    setIsPantryOpen,
    setShowOnboardingWizard,
    shoppingList,
    userProfile
  } = useApp();

  const uncheckedShoppingCount = shoppingList.filter(i => !i.isChecked && !i.isAlreadyHave).length;

  const mainNavItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'mealplan', label: 'Meal Plan', icon: Calendar },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ] as const;

  return (
    <aside className="w-64 bg-[#FFFDF8] border-r border-[#E8EDE9] flex flex-col justify-between p-5 h-screen sticky top-0 shrink-0 select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-[#3FAE68] flex items-center justify-center text-white font-extrabold text-xl shadow-sm shadow-[#3FAE68]/30">
            NP
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-[#17211B] tracking-tight">NutriPlan</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#3FAE68]">
                SA
              </span>
            </div>
            <p className="text-xs text-[#6B756C] font-medium">South Africa</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider px-3 block mb-2">
            Main Menu
          </span>
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-[#17211B] text-white shadow-sm'
                    : 'text-[#6B756C] hover:bg-[#EAF7EF]/50 hover:text-[#17211B]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#3FAE68]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Tools */}
        <div className="space-y-1.5 pt-2 border-t border-[#F0F2F0]">
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider px-3 block mb-2">
            Quick Tools
          </span>

          {/* Health Questionnaire */}
          <button
            onClick={() => setShowOnboardingWizard(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#17211B] text-white hover:bg-black font-bold text-xs transition active:scale-98 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4 text-[#3FAE68]" />
              <span>Personalize Plan</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#3FAE68] text-white">
              Quiz
            </span>
          </button>

          {/* AI Coach */}
          <button
            onClick={() => setIsCoachOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d5eedf] font-bold text-xs transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#3FAE68]" />
              <span>NutriCoach AI</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/80 text-[#2C854E]">
              Ask
            </span>
          </button>

          {/* My Pantry */}
          <button
            onClick={() => setIsPantryOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[#6B756C] hover:bg-black/5 hover:text-[#17211B] font-bold text-xs transition"
          >
            <PackageOpen className="w-4 h-4" />
            <span>My Pantry</span>
          </button>

          {/* Shopping Bag */}
          <button
            onClick={() => setActiveTab('mealplan')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[#6B756C] hover:bg-black/5 hover:text-[#17211B] font-bold text-xs transition"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Shopping List</span>
            </div>
            {uncheckedShoppingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#F2A65A] text-white text-[10px] font-bold">
                {uncheckedShoppingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* User / Auth Footer */}
      <div className="pt-4 border-t border-[#E8EDE9] space-y-3">
        {authUser ? (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#17211B] text-white flex items-center justify-center text-xs font-black shrink-0">
                {authUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#17211B] block truncate">{authUser.name}</span>
                <span className="text-[10px] text-[#3FAE68] font-semibold block">Cloud Synced</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-[#6B756C] hover:text-red-600 rounded-lg hover:bg-black/5 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-[#EAF7EF]/60 border border-[#3FAE68]/20 space-y-2 text-center">
            <span className="text-xs font-bold text-[#17211B] block">Demo Guest Mode</span>
            <p className="text-[10px] text-[#6B756C]">Sign in to sync your meal plan across mobile & desktop.</p>
            <button
              onClick={onOpenLogin}
              className="w-full py-2 rounded-xl bg-[#3FAE68] text-white font-bold text-xs hover:bg-[#349859] transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};