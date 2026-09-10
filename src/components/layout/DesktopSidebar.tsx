import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  UtensilsCrossed,
  Calendar,
  BookOpen,
  TrendingUp,
  ShoppingBag,
  PackageOpen,
  UserCheck,
  User,
  LogOut,
  LogIn,
  ClipboardList,
  Shield,
  Sparkles
} from 'lucide-react';
import { NavTab } from '../../types';

interface DesktopSidebarProps {
  onOpenLogin: () => void;
  authUser: { email: string; name: string; role?: string } | null;
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
    userProfile,
    openUpgradeModal,
  } = useApp();

  const isAdmin = authUser?.role === 'admin' || userProfile?.role === 'admin';
  const uncheckedShoppingCount = shoppingList.filter(i => !i.isChecked && !i.isAlreadyHave).length;

  const mainNavItems: { id: NavTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'diary', label: 'Food Diary', icon: UtensilsCrossed },
    { id: 'mealplan', label: 'Meal Plan', icon: Calendar },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile & Settings', icon: User },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin Console', icon: Shield }] : []),
  ];

  return (
    <aside className="w-64 bg-[#FFFDF8] border-r border-[#E8EDE9] flex flex-col justify-between p-3.5 sm:p-4 h-screen sticky top-0 shrink-0 select-none overflow-y-auto overscroll-contain">
      <div className="space-y-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-1.5 pt-0.5">
          <img
            src="/logo.png"
            alt="NutriPlan SA"
            className="w-9 h-9 rounded-2xl object-cover shadow-xs border border-[#E8EDE9]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-[#17211B] tracking-tight">NutriPlan</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#EAF7EF] text-[#3FAE68]">
                SA
              </span>
            </div>
            <p className="text-[11px] text-[#6B756C] font-medium">South Africa</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider px-2.5 block mb-1.5">
            Main Menu
          </span>
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-[#17211B] text-white shadow-xs'
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
        <div className="space-y-1 pt-2 border-t border-[#F0F2F0]">
          <span className="text-[10px] font-extrabold text-[#6B756C] uppercase tracking-wider px-2.5 block mb-1.5">
            Quick Tools
          </span>

          {/* Health Questionnaire */}
          <button
            onClick={() => setShowOnboardingWizard(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#17211B] text-white hover:bg-black font-bold text-xs transition active:scale-98 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-[#3FAE68]" />
              <span>Personalize Plan</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#3FAE68] text-white">
              Quiz
            </span>
          </button>

          {/* NutriCoach */}
          <button
            onClick={() => setIsCoachOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d5eedf] font-bold text-xs transition active:scale-98"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-[#3FAE68]" />
              <span>NutriCoach</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/80 text-[#2C854E]">
              Chat
            </span>
          </button>

          {/* My Pantry */}
          <button
            onClick={() => setIsPantryOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#6B756C] hover:bg-black/5 hover:text-[#17211B] font-bold text-xs transition"
          >
            <PackageOpen className="w-3.5 h-3.5" />
            <span>My Pantry</span>
          </button>

          {/* Shopping Bag */}
          <button
            onClick={() => setActiveTab('mealplan')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#6B756C] hover:bg-black/5 hover:text-[#17211B] font-bold text-xs transition"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shopping List</span>
            </div>
            {uncheckedShoppingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#F2A65A] text-white text-[10px] font-bold">
                {uncheckedShoppingCount}
              </span>
            )}
          </button>

          {/* Pro Upgrade Trigger for Free Tier */}
          {userProfile.subscriptionTier !== 'pro' && (
            <div
              onClick={() => openUpgradeModal('Pro Features')}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-[#17211B] to-[#25392B] text-white cursor-pointer hover:shadow-md transition active:scale-98 group mt-1"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#3FAE68] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  NutriPlan Pro
                </span>
                <span className="text-[9px] bg-[#3FAE68] text-white px-1.5 py-0.5 rounded font-black">
                  Save 32%
                </span>
              </div>
              <p className="text-[11px] font-bold text-white/90 leading-tight">
                Unlimited Swaps & AI NutriCoach
              </p>
              <span className="text-[10px] text-[#3FAE68] group-hover:underline block mt-0.5 font-bold">
                From R49/mo (R33/mo annual) →
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User / Auth Footer */}
      <div className="pt-3 border-t border-[#E8EDE9] space-y-2 mt-3 shrink-0">
        {authUser ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8F9FA] border border-[#E8EDE9]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#17211B] text-white flex items-center justify-center text-xs font-black shrink-0">
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
          <div className="p-2.5 rounded-2xl bg-[#EAF7EF]/60 border border-[#3FAE68]/20 space-y-1.5 text-center">
            <span className="text-[10px] font-extrabold text-[#2C854E] px-2 py-0.5 rounded-full bg-white border border-[#3FAE68]/30 inline-block shadow-2xs">
              Guest Mode — Register to backup & sync
            </span>
            <p className="text-[10px] text-[#6B756C]">Save your personalized meal plan to cloud.</p>
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-[#3FAE68] text-white font-bold text-xs hover:bg-[#349859] transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Create Account / Sign In</span>
            </button>
          </div>
        )}

        {/* Company Attribution */}
        <div className="text-center">
          <p className="text-[10px] text-[#6B756C]">
            A product of{' '}
            <a
              href="https://www.thabosystems.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2C854E] hover:text-[#3FAE68] font-bold hover:underline transition"
            >
              Thabo Systems
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
};