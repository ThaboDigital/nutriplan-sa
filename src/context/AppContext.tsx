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
  DEFAULT_USER_PROFILE,
  DEFAULT_HABITS,
  DEFAULT_PANTRY,
  DEFAULT_NOTIFICATIONS,
  INITIAL_MILESTONES,
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
  setCurrentDayIndex: (index: number) => void;
  todayWaterMl: number;
  addWaterMl: (amountMl: number) => void;
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
  PROFILE: 'nutriplan_profile_v2',
  PLAN: 'nutriplan_plan_v2',
  WATER: 'nutriplan_water_v2',
  HABITS: 'nutriplan_habits_v2',
  PANTRY: 'nutriplan_pantry_v2',
  SHOPPING: 'nutriplan_shopping_v2',
  NOTIFS: 'nutriplan_notifs_v2',
  NOTIF_PREFS: 'nutriplan_notif_prefs_v2',
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
    return DEFAULT_USER_PROFILE;
  });

  // Weekly Plan
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return generatePersonalizedMealPlan(DEFAULT_USER_PROFILE);
  });

  // Water
  const [todayWaterMl, setTodayWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return 0;
  });

  // Habits
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_HABITS;
  });

  // Pantry
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PANTRY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PANTRY;
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_NOTIFICATIONS;
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

  // Shopping List
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return generateShoppingListFromMealPlan(weeklyPlan);
  });

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [milestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [activeTab, setActiveTab] = useState<'home' | 'mealplan' | 'recipes' | 'progress' | 'profile'>('home');

  // Modals
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [isFoodLogOpen, setIsFoodLogOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [swapModalTargetMeal, setSwapModalTargetMeal] = useState<PlannedMeal | null>(null);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState<boolean>(() => !userProfile.onboardingCompleted);

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Auth Listener & Cloud Sync
  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setAuthUser(user);
    });

    const sub = authService.onAuthStateChange(async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const cloudData = await dataSyncService.loadAllUserData(user.id);
          if (cloudData.profile) {
            setUserProfile(cloudData.profile);
          }
          if (cloudData.weeklyPlan && cloudData.weeklyPlan.length > 0) {
            setWeeklyPlan(cloudData.weeklyPlan);
          }
          if (cloudData.todayWaterMl !== null) {
            setTodayWaterMl(cloudData.todayWaterMl);
          }
          if (cloudData.habits && cloudData.habits.length > 0) {
            setHabits(cloudData.habits);
          }
          if (cloudData.pantryItems) {
            setPantryItems(cloudData.pantryItems);
          }
          if (cloudData.shoppingList && cloudData.shoppingList.length > 0) {
            setShoppingList(cloudData.shoppingList);
          }
          if (cloudData.notificationPreferences) {
            setNotificationPreferences(cloudData.notificationPreferences);
          }
        } catch (e) {
          console.warn('Initial cloud sync notice:', e);
        }
      }
    });

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, []);

  // Save to LocalStorage & Cloud
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    if (authUser?.id) {
      dataSyncService.syncProfile(authUser.id, userProfile);
    }
  }, [userProfile, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(weeklyPlan));
    if (authUser?.id) {
      dataSyncService.syncEntireMealPlan(authUser.id, weeklyPlan);
    }
  }, [weeklyPlan, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(todayWaterMl));
    if (authUser?.id) {
      dataSyncService.syncWater(authUser.id, todayWaterMl, (userProfile.dailyWaterTargetLiters || 2.0) * 1000);
    }
  }, [todayWaterMl, authUser, userProfile.dailyWaterTargetLiters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIF_PREFS, JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  // Actions
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });
  };

  const addWaterMl = (amountMl: number) => {
    setTodayWaterMl((prev) => {
      const next = prev + amountMl;
      const targetMl = (userProfile.dailyWaterTargetLiters || 2.0) * 1000;
      if (prev < targetMl && next >= targetMl) {
        showToast('Daily hydration target reached!', 'success');
        setHabits((hList) =>
          hList.map((h) => (h.id === 'hab_water' ? { ...h, isCompletedToday: true } : h))
        );
      }
      return next;
    });
  };

  const resetWaterToday = () => {
    setTodayWaterMl(0);
    setHabits((hList) =>
      hList.map((h) => (h.id === 'hab_water' ? { ...h, isCompletedToday: false } : h))
    );
    showToast('Water counter reset for today', 'info');
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item));
      const target = updated.find((i) => i.id === id);
      if (target && authUser?.id) {
        dataSyncService.syncShoppingItem(authUser.id, target, 'upsert');
      }
      return updated;
    });
  };

  const toggleAlreadyHaveItem = (id: string) => {
    setShoppingList((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isAlreadyHave: !item.isAlreadyHave } : item
      );
      const target = updated.find((i) => i.id === id);
      if (target && authUser?.id) {
        dataSyncService.syncShoppingItem(authUser.id, target, 'upsert');
      }
      return updated;
    });
  };

  const addCustomShoppingItem = (
    name: string,
    category: ShoppingItem['category'],
    quantity: number,
    unit: string
  ) => {
    const newItem: ShoppingItem = {
      id: `custom_${Date.now()}`,
      name,
      category,
      quantity,
      unit,
      isChecked: false,
      isAlreadyHave: false,
      estimatedCostZAR: 25,
      associatedRecipeTitles: [],
    };
    setShoppingList((prev) => [newItem, ...prev]);
    if (authUser?.id) {
      dataSyncService.syncShoppingItem(authUser.id, newItem, 'upsert');
    }
    showToast(`Added ${name} to shopping list`);
  };

  const removeShoppingItem = (id: string) => {
    const target = shoppingList.find((i) => i.id === id);
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
    if (target && authUser?.id) {
      dataSyncService.syncShoppingItem(authUser.id, target, 'delete');
    }
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const nextState = !habit.isCompletedToday;
          const nextStreak = nextState ? habit.currentStreak + 1 : Math.max(0, habit.currentStreak - 1);
          if (nextState) {
            showToast(`Completed: ${habit.title}! Streak: ${nextStreak} days`, 'success');
          }
          if (authUser?.id) {
            dataSyncService.syncHabitToggle(authUser.id, id, nextState);
          }
          return {
            ...habit,
            isCompletedToday: nextState,
            currentStreak: nextStreak,
          };
        }
        return habit;
      })
    );
  };

  const addPantryItem = (name: string, category: string = 'Pantry') => {
    const newItem: PantryItem = {
      id: `pantry_${Date.now()}`,
      name,
      category,
      isCommon: false,
    };
    setPantryItems((prev) => [newItem, ...prev]);
    if (authUser?.id) {
      dataSyncService.syncPantryItem(authUser.id, newItem, 'add');
    }
    showToast(`Added ${name} to your pantry`);
  };

  const removePantryItem = (id: string) => {
    const target = pantryItems.find((p) => p.id === id);
    setPantryItems((prev) => prev.filter((p) => p.id !== id));
    if (target && authUser?.id) {
      dataSyncService.syncPantryItem(authUser.id, target, 'remove');
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  };

  const updateNotificationPreferences = (updates: Partial<NotificationPreferences>) => {
    setNotificationPreferences((prev) => ({ ...prev, ...updates }));
    showToast('Notification settings updated');
  };

  const swapMeal = (targetMealId: string, newRecipe: Recipe) => {
    setWeeklyPlan((prev) => {
      const updated = swapMealInPlan(prev, targetMealId, newRecipe);
      setShoppingList(generateShoppingListFromMealPlan(updated));
      return updated;
    });
    showToast(`Swapped for ${newRecipe.title}`);
  };

  const markMealEaten = (mealId: string) => {
    setWeeklyPlan((prev) => {
      const updated = prev.map((day) => ({
        ...day,
        meals: day.meals.map((meal) => {
          if (meal.id === mealId) {
            const nextEaten = !meal.isEaten;
            if (authUser?.id) {
              dataSyncService.syncMealEaten(authUser.id, mealId, nextEaten);
            }
            return { ...meal, isEaten: nextEaten, eatenAt: nextEaten ? new Date().toISOString() : undefined };
          }
          return meal;
        }),
      }));
      return updated;
    });
    showToast('Meal status updated');
  };

  const regenerateMeal = (mealId: string) => {
    const randomRecipe = SA_RECIPES[Math.floor(Math.random() * SA_RECIPES.length)];
    swapMeal(mealId, randomRecipe);
  };

  const regenerateEntireWeek = () => {
    const freshPlan = generatePersonalizedMealPlan(userProfile);
    setWeeklyPlan(freshPlan);
    setShoppingList(generateShoppingListFromMealPlan(freshPlan));
    showToast('Generated a fresh 7-day South African meal plan', 'success');
  };

  const regenerateSingleDay = (dayOfWeek: string) => {
    setWeeklyPlan((prev) => {
      const targetDayIndex = prev.findIndex((d) => d.dayOfWeek === dayOfWeek);
      if (targetDayIndex === -1) return prev;
      const fullWeek = generatePersonalizedMealPlan(userProfile);
      const replacementDay = fullWeek[targetDayIndex];
      const updatedPlan = [...prev];
      updatedPlan[targetDayIndex] = replacementDay;
      setShoppingList(generateShoppingListFromMealPlan(updatedPlan));
      return updatedPlan;
    });
    showToast(`Updated meals for ${dayOfWeek}`, 'info');
  };

  const resetToDemo = () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setUserProfile(DEFAULT_USER_PROFILE);
    const newPlan = generatePersonalizedMealPlan(DEFAULT_USER_PROFILE);
    setWeeklyPlan(newPlan);
    setTodayWaterMl(0);
    setHabits(DEFAULT_HABITS);
    setPantryItems(DEFAULT_PANTRY);
    setShoppingList(generateShoppingListFromMealPlan(newPlan));
    setNotifications(DEFAULT_NOTIFICATIONS);
    setShowOnboardingWizard(true);
    showToast('Reset to clean state. Start your personalized plan questionnaire!', 'info');
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

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};