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
import { supabase } from './services/supabaseClient';
import { resendEmailService } from './services/resendEmailService';

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
import { FoodDiaryView } from './components/diary/FoodDiaryView';
import { FoodLogModal } from './components/diary/FoodLogModal';
import { WeeklyReviewModal } from './components/progress/WeeklyReviewModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { UpgradeModal } from './components/subscription/UpgradeModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Plus } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setIsFoodLogOpen,
    showToast,
    isLoginOpen,
    setIsLoginOpen,
    loginInitialMode,
    authUser,
    setAuthUser,
    updateUserProfile,
    logout,
  } = useApp();
  const [migrationSummary, setMigrationSummary] = useState<MigrationSummary | null>(null);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    if (p.includes('privacy') || h.includes('privacy')) return '/privacy';
    if (p.includes('terms') || h.includes('terms')) return '/terms';
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p.includes('privacy') || h.includes('privacy')) {
        setCurrentPath('/privacy');
      } else if (p.includes('terms') || h.includes('terms')) {
        setCurrentPath('/terms');
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    // Listen to Auth State
    const { unsubscribe } = authService.onAuthStateChange(user => {
      setAuthUser(user);
      if (user && !user.isGuest) {
        if (user.name && user.name !== 'User') {
          updateUserProfile({ name: user.name });
        }
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
  }, [setAuthUser, updateUserProfile]);

  // Handle PayFast Payment Return & Subscription Welcome Email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const tier = (params.get('tier') as 'monthly' | 'annual') || 'monthly';

    if (paymentStatus === 'success') {
      const activeUser = authUser || (() => {
        const saved = localStorage.getItem('nutriplan_auth_user');
        return saved ? JSON.parse(saved) : null;
      })();

      if (activeUser?.id) {
        // 1. Activate Pro in Supabase
        supabase.from('profiles').update({
          subscription_tier: 'pro',
          subscription_period: tier,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        }).eq('id', activeUser.id).then(() => {
          updateUserProfile({ subscriptionTier: 'pro' });
          const updatedAuth = {
            ...activeUser,
            subscriptionTier: 'pro' as const,
            subscriptionPeriod: tier,
            subscriptionStatus: 'active' as const,
          };
          setAuthUser(updatedAuth);
          localStorage.setItem('nutriplan_auth_user', JSON.stringify(updatedAuth));

          // 2. Send Resend Pro Subscription Email
          if (activeUser.email) {
            resendEmailService.sendSubscriptionWelcomeEmail({
              to: activeUser.email,
              name: activeUser.name,
              tier,
              amount: tier === 'annual' ? 399 : 49,
            }).then(res => {
              if (res.success) {
                showToast('Welcome email sent to your inbox!', 'success');
              }
            });
          }
        });
      } else {
        updateUserProfile({ subscriptionTier: 'pro' });
      }

      showToast('🎉 Welcome to NutriPlan Pro! Unlimited access activated.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      showToast('Payment was cancelled. You can upgrade anytime!', 'info');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [authUser, updateUserProfile, setAuthUser, showToast]);

  const handleLogout = async () => {
    await logout();
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    if (user.name && user.name !== 'User') {
      updateUserProfile({ name: user.name });
    }
    localStorage.setItem('nutriplan_auth_user', JSON.stringify(user));
    showToast(`Welcome, ${user.name}! Cloud sync active.`, 'success');
  };

  // Dedicated Public Legal Routes (Unauthenticated / Google Play compliant)
  if (currentPath === '/privacy') {
    return (
      <PrivacyPolicy
        onBack={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  if (currentPath === '/terms') {
    return (
      <TermsOfService
        onBack={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#182018] flex flex-col antialiased">
      {/* Production Responsive Layout (Mobile on phones, Sidebar on tablets/desktop) */}
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
          <main className="flex-1 w-full p-0 md:p-6 overflow-y-auto pb-safe md:pb-0">
            {activeTab === 'home' && <HomeDashboard />}
            {activeTab === 'diary' && <FoodDiaryView />}
            {activeTab === 'mealplan' && <MealPlanView />}
            {activeTab === 'recipes' && <RecipeCatalog />}
            {activeTab === 'progress' && <ProgressDashboard />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'admin' && <AdminDashboard />}
          </main>
        </div>

        {/* Mobile Bottom Navigation (Visible only on mobile < md) */}
        <div className="block md:hidden">
          <BottomNav />
          {(activeTab === 'home' || activeTab === 'diary') && (
            <button
              onClick={() => setIsFoodLogOpen(true)}
              className="fixed bottom-20 right-4 z-30 h-11 px-4 rounded-full bg-[#17211B]/95 backdrop-blur-md text-white shadow-xl flex items-center gap-1.5 active:scale-95 transition border border-white/10"
              title="Quick Food Log"
            >
              <Plus className="w-4 h-4 text-[#3FAE68]" />
              <span className="text-xs font-black">Log Food</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Modals & Overlays */}
      <RecipeDetailModal />
      <CookingModeModal />
      <SwapMealModal />
      <NutriCoachChat />
      <PantryModal />
      <FoodLogModal />
      <WeeklyReviewModal />
      <OnboardingWizard />
      <UpgradeModal />
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