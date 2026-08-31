import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  DayPlan,
  ShoppingItem,
  HabitItem,
  AppNotification,
  Milestone,
  Recipe,
  PantryItem,
  NotificationPreferences,
  PlannedMeal
} from '../types';
import {
  DEMO_PROFILE,
  INITIAL_HABITS,
  INITIAL_PANTRY,
  INITIAL_NOTIFICATIONS,
  INITIAL_MILESTONES,
  buildDemoSevenDayPlan
} from '../data/demoProfile';
import { generateShoppingListFromMealPlan } from '../services/shoppingListService';
import { generatePersonalizedMealPlan, swapMealInPlan } from '../services/mealPlannerService';
import { SA_RECIPES } from '../data/saFoodDatabase';
import { authService, AuthUser } from '../services/authService';
import { dataSyncService } from '../services/dataSyncService';

interface ToastState {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface AppContextType {
  authUser: AuthUser | null;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  weeklyPlan: DayPlan[];
  setWeeklyPlan: React.Dispatch<React.SetStateAction<DayPlan[]>>;
  currentDayIndex: number;
  setCurrentDayIndex: (idx: number) => void;
  todayWaterMl: number;
  addWaterMl: (amount: number) => void;
  resetWaterToday: () => void;
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  toggleAlreadyHaveItem: (id: string) => void;
  addCustomShoppingItem: (name: string, category: ShoppingItem['category'], quantity: number, unit: string) => void;
  removeShoppingItem: (id: string) => void;
  habits: HabitItem[];
  toggleHabit: (id: string) => void;
  pantryItems: PantryItem[];
  addPantryItem: (name: string, category?: string) => void;
  removePantryItem: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void;
  milestones: Milestone[];
  activeTab: 'home' | 'mealplan' | 'recipes' | 'progress' | 'profile';
  setActiveTab: (tab: 'home' | 'mealplan' | 'recipes' | 'progress' | 'profile') => void;
  
  // Modals & Triggers
  isCoachOpen: boolean;
  setIsCoachOpen: (open: boolean) => void;
  isPantryOpen: boolean;
  setIsPantryOpen: (open: boolean) => void;
  isFoodLogOpen: boolean;
  setIsFoodLogOpen: (open: boolean) => void;
  isWeeklyReviewOpen: boolean;
  setIsWeeklyReviewOpen: (open: boolean) => void;
  selectedRecipeForDetail: Recipe | null;
  setSelectedRecipeForDetail: (recipe: Recipe | null) => void;
  cookingRecipe: Recipe | null;
  setCookingRecipe: (recipe: Recipe | null) => void;
  swapModalTargetMeal: PlannedMeal | null;
  setSwapModalTargetMeal: (meal: PlannedMeal | null) => void;
  showOnboardingWizard: boolean;
  setShowOnboardingWizard: (show: boolean) => void;

  // Actions
  swapMeal: (targetMealId: string, newRecipe: Recipe) => void;
  markMealEaten: (mealId: string) => void;
  regenerateMeal: (mealId: string) => void;
  regenerateEntireWeek: () => void;
  regenerateSingleDay: (dayOfWeek: string) => void;
  resetToDemo: () => void;
  
  // Toast notifications
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'nutriplan_profile_v1',
  PLAN: 'nutriplan_plan_v1',
  WATER: 'nutriplan_water_v1',
  HABITS: 'nutriplan_habits_v1',
  PANTRY: 'nutriplan_pantry_v1',
  SHOPPING: 'nutriplan_shopping_v1',
  NOTIFS: 'nutriplan_notifs_v1',
  NOTIF_PREFS: 'nutriplan_notif_prefs_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const authUserRef = useRef<AuthUser | null>(null);
  authUserRef.current = authUser;

  // Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEMO_PROFILE;
  });

  // Weekly Plan
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return buildDemoSevenDayPlan();
  });

  // Water
  const [todayWaterMl, setTodayWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return 1250;
  });

  // Habits
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_HABITS;
  });

  // Pantry
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PANTRY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PANTRY;
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Notification Preferences
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIF_PREFS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      waterReminders: true,
      waterIntervalHours: 2,
      waterStartTime: '08:00',
      waterEndTime: '20:00',
      mealReminders: true,
      shoppingAlerts: true,
      movementReminders: true,
      sleepReminders: true,
      sleepTime: '22:00',
      progressReview: true,
      motivationAlerts: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:30',
    };
  });

  const [milestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [activeTab, setActiveTab] = useState<'home' | 'mealplan' | 'recipes' | 'progress' | 'profile'>('home');
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Modals state
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [isFoodLogOpen, setIsFoodLogOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [swapModalTargetMeal, setSwapModalTargetMeal] = useState<PlannedMeal | null>(null);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

  // Shopping List
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return generateShoppingListFromMealPlan(weeklyPlan, pantryItems.map(p => p.name));
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Auth State Listener & Initial Cloud Sync
  useEffect(() => {
    const { unsubscribe } = authService.onAuthStateChange(async user => {
      setAuthUser(user);
      if (user && !user.isGuest) {
        // Load real cloud data from Supabase
        const cloud = await dataSyncService.loadAllUserData(user.id);
        if (cloud.profile) setUserProfile(cloud.profile);
        if (cloud.weeklyPlan && cloud.weeklyPlan.length > 0) setWeeklyPlan(cloud.weeklyPlan);
        if (cloud.todayWaterMl !== null) setTodayWaterMl(cloud.todayWaterMl);
        if (cloud.habits && cloud.habits.length > 0) setHabits(cloud.habits);
        if (cloud.pantryItems && cloud.pantryItems.length > 0) setPantryItems(cloud.pantryItems);
        if (cloud.shoppingList && cloud.shoppingList.length > 0) setShoppingList(cloud.shoppingList);
        if (cloud.notificationPreferences) setNotificationPreferences(cloud.notificationPreferences);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(weeklyPlan));
    const updatedShopping = generateShoppingListFromMealPlan(weeklyPlan, pantryItems.map(p => p.name));
    setShoppingList(updatedShopping);
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(updatedShopping));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(todayWaterMl));
    if (todayWaterMl >= userProfile.dailyWaterTargetLiters * 1000) {
      setHabits(prev => prev.map(h => h.category === 'water' ? { ...h, isCompletedToday: true } : h));
    }
  }, [todayWaterMl, userProfile.dailyWaterTargetLiters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIF_PREFS, JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  // Actions with Cloud Sync
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      if (authUserRef.current && !authUserRef.current.isGuest) {
        dataSyncService.syncProfile(authUserRef.current.id, updated);
      }
      return updated;
    });
  };

  const addWaterMl = (amount: number) => {
    setTodayWaterMl(prev => {
      const next = Math.max(0, prev + amount);
      if (prev < userProfile.dailyWaterTargetLiters * 1000 && next >= userProfile.dailyWaterTargetLiters * 1000) {
        showToast('💧 Daily water target reached! Excellent work!', 'success');
      } else {
        showToast(`💧 Added ${amount} ml of water`, 'info');
      }
      if (authUserRef.current && !authUserRef.current.isGuest) {
        dataSyncService.syncWater(authUserRef.current.id, next, userProfile.dailyWaterTargetLiters * 1000);
      }
      return next;
    });
  };

  const resetWaterToday = () => {
    setTodayWaterMl(0);
    if (authUserRef.current && !authUserRef.current.isGuest) {
      dataSyncService.syncWater(authUserRef.current.id, 0, userProfile.dailyWaterTargetLiters * 1000);
    }
    showToast('Water counter reset for today', 'info');
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const next = { ...item, isChecked: !item.isChecked };
          if (authUserRef.current && !authUserRef.current.isGuest) {
            dataSyncService.syncShoppingItem(authUserRef.current.id, next, 'upsert');
          }
          return next;
        }
        return item;
      });
      return updated;
    });
  };

  const toggleAlreadyHaveItem = (id: string) => {
    setShoppingList(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const next = { ...item, isAlreadyHave: !item.isAlreadyHave };
          if (authUserRef.current && !authUserRef.current.isGuest) {
            dataSyncService.syncShoppingItem(authUserRef.current.id, next, 'upsert');
          }
          return next;
        }
        return item;
      });
      return updated;
    });
  };

  const addCustomShoppingItem = (name: string, category: ShoppingItem['category'], quantity: number, unit: string) => {
    const newItem: ShoppingItem = {
      id: `shop_custom_${Date.now()}`,
      name,
      category,
      quantity,
      unit,
      estimatedCostZAR: 20,
      isChecked: false,
      isAlreadyHave: false,
      associatedRecipeTitles: ['Custom Item'],
    };
    setShoppingList(prev => [newItem, ...prev]);
    if (authUserRef.current && !authUserRef.current.isGuest) {
      dataSyncService.syncShoppingItem(authUserRef.current.id, newItem, 'upsert');
    }
    showToast(`Added "${name}" to shopping list`);
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => {
      const target = prev.find(i => i.id === id);
      if (target && authUserRef.current && !authUserRef.current.isGuest) {
        dataSyncService.syncShoppingItem(authUserRef.current.id, target, 'delete');
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = !h.isCompletedToday;
        if (nextState) {
          showToast(`✓ Completed: ${h.title}`, 'success');
        }
        if (authUserRef.current && !authUserRef.current.isGuest) {
          dataSyncService.syncHabitToggle(authUserRef.current.id, id, nextState);
        }
        return {
          ...h,
          isCompletedToday: nextState,
          currentStreak: nextState ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1)
        };
      }
      return h;
    }));
  };

  const addPantryItem = (name: string, category = 'Pantry') => {
    if (!name.trim()) return;
    const newItem: PantryItem = {
      id: `p_${Date.now()}`,
      name: name.trim(),
      category,
      isCommon: false,
    };
    setPantryItems(prev => [newItem, ...prev]);
    if (authUserRef.current && !authUserRef.current.isGuest) {
      dataSyncService.syncPantryItem(authUserRef.current.id, newItem, 'add');
    }
    showToast(`Added ${name} to My Pantry`);
  };

  const removePantryItem = (id: string) => {
    setPantryItems(prev => {
      const target = prev.find(p => p.id === id);
      if (target && authUserRef.current && !authUserRef.current.isGuest) {
        dataSyncService.syncPantryItem(authUserRef.current.id, target, 'remove');
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  const updateNotificationPreferences = (updates: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prev => ({ ...prev, ...updates }));
    showToast('Notification settings saved');
  };

  const swapMeal = (targetMealId: string, newRecipe: Recipe) => {
    setWeeklyPlan(prev => {
      const updatedPlan = swapMealInPlan(prev, targetMealId, newRecipe);
      if (authUserRef.current && !authUserRef.current.isGuest) {
        dataSyncService.syncEntireMealPlan(authUserRef.current.id, updatedPlan);
      }
      return updatedPlan;
    });
    showToast(`Swapped to ${newRecipe.title}. Shopping list updated!`, 'success');
    setSwapModalTargetMeal(null);
  };

  const markMealEaten = (mealId: string) => {
    setWeeklyPlan(prev => {
      const updated = prev.map(day => ({
        ...day,
        meals: day.meals.map(m => {
          if (m.id === mealId) {
            const nextEaten = !m.isEaten;
            if (authUserRef.current && !authUserRef.current.isGuest) {
              dataSyncService.syncMealEaten(authUserRef.current.id, mealId, nextEaten);
            }
            return {
              ...m,
              isEaten: nextEaten,
              eatenAt: nextEaten ? 'Just now' : undefined
            };
          }
          return m;
        })
      }));
      return updated;
    });
    showToast('Meal status updated', 'info');
  };

  const regenerateMeal = (mealId: string) => {
    const available = SA_RECIPES.filter(r => {
      if (userProfile.dietaryPreference === 'lower_carb') {
        return r.tags.includes('Low Carb') || r.nutrition.carbsG <= 25;
      }
      return true;
    });
    const randomPick = available[Math.floor(Math.random() * available.length)];
    if (randomPick) {
      swapMeal(mealId, randomPick);
      showToast(`Regenerated new meal: ${randomPick.title}`, 'success');
    }
  };

  const regenerateEntireWeek = () => {
    const newPlan = generatePersonalizedMealPlan(userProfile);
    setWeeklyPlan(newPlan);
    if (authUserRef.current && !authUserRef.current.isGuest) {
      dataSyncService.syncEntireMealPlan(authUserRef.current.id, newPlan);
    }
    showToast('Fresh 7-day meal plan generated! Shopping list updated.', 'success');
  };

  const regenerateSingleDay = (dayOfWeek: string) => {
    const available = SA_RECIPES;
    setWeeklyPlan(prev => {
      const updatedPlan = prev.map(day => {
        if (day.dayOfWeek === dayOfWeek) {
          const updatedMeals = day.meals.map((m, idx) => {
            const pick = available[(idx + Math.floor(Math.random() * available.length)) % available.length];
            return {
              ...m,
              recipe: pick,
              whyThisMeal: `Fresh daily recommendation: high protein & quick cook.`,
              isEaten: false,
            };
          });
          return {
            ...day,
            meals: updatedMeals,
            totalCalories: updatedMeals.reduce((a, b) => a + b.recipe.nutrition.calories, 0),
            totalProteinG: updatedMeals.reduce((a, b) => a + b.recipe.nutrition.proteinG, 0),
          };
        }
        return day;
      });

      if (authUserRef.current && !authUserRef.current.isGuest) {
        dataSyncService.syncEntireMealPlan(authUserRef.current.id, updatedPlan);
      }
      return updatedPlan;
    });
    showToast(`Updated meals for ${dayOfWeek}`, 'info');
  };

  const resetToDemo = () => {
    setUserProfile(DEMO_PROFILE);
    setWeeklyPlan(buildDemoSevenDayPlan());
    setTodayWaterMl(1250);
    setHabits(INITIAL_HABITS);
    setPantryItems(INITIAL_PANTRY);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Reset back to Thabo’s preloaded demo state', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        userProfile,
        updateUserProfile,
        weeklyPlan,
        setWeeklyPlan,
        currentDayIndex,
        setCurrentDayIndex,
        todayWaterMl,
        addWaterMl,
        resetWaterToday,
        shoppingList,
        toggleShoppingItem,
        toggleAlreadyHaveItem,
        addCustomShoppingItem,
        removeShoppingItem,
        habits,
        toggleHabit,
        pantryItems,
        addPantryItem,
        removePantryItem,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        notificationPreferences,
        updateNotificationPreferences,
        milestones,
        activeTab,
        setActiveTab,
        isCoachOpen,
        setIsCoachOpen,
        isPantryOpen,
        setIsPantryOpen,
        isFoodLogOpen,
        setIsFoodLogOpen,
        isWeeklyReviewOpen,
        setIsWeeklyReviewOpen,
        selectedRecipeForDetail,
        setSelectedRecipeForDetail,
        cookingRecipe,
        setCookingRecipe,
        swapModalTargetMeal,
        setSwapModalTargetMeal,
        showOnboardingWizard,
        setShowOnboardingWizard,
        swapMeal,
        markMealEaten,
        regenerateMeal,
        regenerateEntireWeek,
        regenerateSingleDay,
        resetToDemo,
        toasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};