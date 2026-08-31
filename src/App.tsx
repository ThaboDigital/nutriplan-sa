import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';

import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { DesktopTopHeader } from './components/layout/DesktopTopHeader';
import { LoginModal } from './components/auth/LoginModal';
import { DataMigrationModal } from './components/auth/DataMigrationModal';
import { authService, AuthUser } from './services/authService';
import { migrationService, MigrationSummary } from './services/migrationService';

import { HomeDashboard } from './components/home/HomeDashboard';
import { MealPlanView } from './components/mealplan/MealPlanView';
import { RecipeCatalog } from './components/recipes/RecipeCatalog';
import { ProgressDashboard } from './components/progress/ProgressDashboard';
import { ProfileView } from './components/profile/ProfileView';

import { RecipeDetailModal } from './components/recipes/RecipeDetailModal';
import { CookingModeModal } from './components/recipes/CookingModeModal';
import { SwapMealModal } from './components/mealplan/SwapMealModal';
import { NutriCoachChat } from './components/coach/NutriCoachChat';
import { PantryModal } from './components/pantry/PantryModal';
import { QuickFoodLogModal } from './components/foodlog/QuickFoodLogModal';
import { WeeklyReviewModal } from './components/progress/WeeklyReviewModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Smartphone, Monitor } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setIsFoodLogOpen, showToast, isLoginOpen, setIsLoginOpen, loginInitialMode, openAuthModal } = useApp();
  const [devicePreviewMode, setDevicePreviewMode] = useState<'desktop' | 'mobile_frame'>('desktop');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [migrationSummary, setMigrationSummary] = useState<MigrationSummary | null>(null);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  useEffect(() => {
    // Listen to Auth State
    const { unsubscribe } = authService.onAuthStateChange(user => {
      setAuthUser(user);
      if (user && !user.isGuest) {
        // Check for local data migration
        const summary = migrationService.detectLocalData();
        const alreadyMigrated = localStorage.getItem('nutriplan_migrated_user') === user.id;
        if (summary.hasLocalData && !alreadyMigrated) {
          setMigrationSummary(summary);
          setIsMigrationOpen(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    setAuthUser(null);
    showToast('Signed out of cloud account', 'info');
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    showToast(`Welcome, ${user.name}! Cloud sync active.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#182018] flex flex-col antialiased">
      {/* Viewport Mode Switcher Bar (Desktop / Development Helper) */}
      <div className="hidden lg:flex w-full bg-[#17211B] text-white px-6 py-2 items-center justify-between text-xs z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3FAE68] animate-pulse" />
          <span className="font-extrabold tracking-wide">NutriPlan SA</span>
          <span className="text-white/60 text-[11px]">| Phase 2 Responsive Web & Supabase Architecture</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[11px] mr-1">Preview Layout:</span>
          <button
            onClick={() => setDevicePreviewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
              devicePreviewMode === 'desktop' ? 'bg-[#3FAE68] text-white' : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Responsive Desktop</span>
          </button>

          <button
            onClick={() => setDevicePreviewMode('mobile_frame')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
              devicePreviewMode === 'mobile_frame' ? 'bg-[#3FAE68] text-white' : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device (390px)</span>
          </button>
        </div>
      </div>

      {/* RENDER MODE 1: Simulated 390px Mobile Phone Frame (For testing phone screen on wide monitor) */}
      {devicePreviewMode === 'mobile_frame' ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[430px] rounded-[44px] border-[10px] border-[#17211B] shadow-2xl bg-[#FFFDF8] h-[880px] flex flex-col overflow-hidden relative">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {activeTab === 'home' && <HomeDashboard />}
              {activeTab === 'mealplan' && <MealPlanView />}
              {activeTab === 'recipes' && <RecipeCatalog />}
              {activeTab === 'progress' && <ProgressDashboard />}
              {activeTab === 'profile' && <ProfileView />}
            </main>
            <BottomNav />
            <button
              onClick={() => setIsFoodLogOpen(true)}
              className="absolute bottom-20 right-5 z-30 w-12 h-12 rounded-full bg-[#17211B] text-white shadow-xl flex items-center justify-center hover:bg-black active:scale-95 transition"
              title="Quick Food Log"
            >
              <span className="text-xl font-bold leading-none">+</span>
            </button>
          </div>
        </div>
      ) : (
        /* RENDER MODE 2: Production Responsive Web (Mobile on phones, Sidebar on tablets/desktop) */
        <div className="flex-1 flex flex-col md:flex-row w-full min-h-screen">
          {/* Desktop Left Sidebar (Visible on md/lg/xl) */}
          <div className="hidden md:block shrink-0">
            <DesktopSidebar
              onOpenLogin={() => setIsLoginOpen(true)}
              authUser={authUser}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile Top Header (Visible only on mobile < md) */}
          <div className="block md:hidden sticky top-0 z-30 w-full">
            <Header />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FFFDF8]">
            {/* Desktop Top Header Bar */}
            <div className="hidden md:block">
              <DesktopTopHeader
                onOpenLogin={() => setIsLoginOpen(true)}
                authUser={authUser}
              />
            </div>

            {/* Viewport Router / Active Tab View */}
            <main className="flex-1 w-full p-2 sm:p-4 md:p-6 overflow-y-auto">
              {activeTab === 'home' && <HomeDashboard />}
              {activeTab === 'mealplan' && <MealPlanView />}
              {activeTab === 'recipes' && <RecipeCatalog />}
              {activeTab === 'progress' && <ProgressDashboard />}
              {activeTab === 'profile' && <ProfileView />}
            </main>
          </div>

          {/* Mobile Bottom Navigation (Visible only on mobile < md) */}
          <div className="block md:hidden">
            <BottomNav />
            <button
              onClick={() => setIsFoodLogOpen(true)}
              className="fixed bottom-20 right-5 z-30 w-12 h-12 rounded-full bg-[#17211B] text-white shadow-xl flex items-center justify-center hover:bg-black active:scale-95 transition"
              title="Quick Food Log"
            >
              <span className="text-xl font-bold leading-none">+</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Modals & Overlays */}
      <RecipeDetailModal />
      <CookingModeModal />
      <SwapMealModal />
      <NutriCoachChat />
      <PantryModal />
      <QuickFoodLogModal />
      <WeeklyReviewModal />
      <OnboardingWizard />
      <ToastContainer />

      {/* Auth & Migration Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={loginInitialMode}
      />

      {migrationSummary && authUser && (
        <DataMigrationModal
          isOpen={isMigrationOpen}
          onClose={() => setIsMigrationOpen(false)}
          userId={authUser.id}
          summary={migrationSummary}
          onMigrated={() => showToast('Local data migrated to cloud account!', 'success')}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;