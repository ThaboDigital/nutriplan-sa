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
      quietHoursEnabled: true,
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

  // Auth Listener
  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setAuthUser(user);
    });

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const cloudProfile = await dataSyncService.fetchProfile(user.id);
          if (cloudProfile) {
            setUserProfile(cloudProfile);
          }
          const cloudMeals = await dataSyncService.fetchMealPlan(user.id);
          if (cloudMeals && cloudMeals.length > 0) {
            setWeeklyPlan(cloudMeals);
          }
          const cloudWater = await dataSyncService.fetchTodayWater(user.id);
          if (cloudWater !== null) {
            setTodayWaterMl(cloudWater);
          }
          const cloudHabits = await dataSyncService.fetchHabits(user.id);
          if (cloudHabits && cloudHabits.length > 0) {
            setHabits(cloudHabits);
          }
          const cloudPantry = await dataSyncService.fetchPantry(user.id);
          if (cloudPantry) {
            setPantryItems(cloudPantry);
          }
          const cloudShopping = await dataSyncService.fetchShoppingList(user.id);
          if (cloudShopping && cloudShopping.length > 0) {
            setShoppingList(cloudShopping);
          }
        } catch (e) {
          console.warn('Initial cloud sync notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    if (authUser?.id) {
      dataSyncService.syncProfile(authUser.id, userProfile);
    }
  }, [userProfile, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(weeklyPlan));
    if (authUser?.id) {
      dataSyncService.syncMealPlan(authUser.id, weeklyPlan);
    }
  }, [weeklyPlan, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(todayWaterMl));
    if (authUser?.id) {
      dataSyncService.syncWaterLog(authUser.id, todayWaterMl);
    }
  }, [todayWaterMl, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    if (authUser?.id) {
      dataSyncService.syncHabits(authUser.id, habits);
    }
  }, [habits, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(pantryItems));
    if (authUser?.id) {
      dataSyncService.syncPantry(authUser.id, pantryItems);
    }
  }, [pantryItems, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingList));
    if (authUser?.id) {
      dataSyncService.syncShoppingList(authUser.id, shoppingList);
    }
  }, [shoppingList, authUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIF_PREFS, JSON.stringify(notificationPreferences));
    if (authUser?.id) {
      dataSyncService.syncNotificationPreferences(authUser.id, notificationPreferences);
    }
  }, [notificationPreferences, authUser]);

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
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item))
    );
  };

  const toggleAlreadyHaveItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAlreadyHave: !item.isAlreadyHave } : item
      )
    );
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
      day: 'General',
    };
    setShoppingList((prev) => [newItem, ...prev]);
    showToast(`Added ${name} to shopping list`);
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
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
    showToast(`Added ${name} to your pantry`);
  };

  const removePantryItem = (id: string) => {
    setPantryItems((prev) => prev.filter((p) => p.id !== id));
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
    setWeeklyPlan((prev) =>
      prev.map((day) => ({
        ...day,
        meals: day.meals.map((meal) =>
          meal.id === mealId ? { ...meal, isEaten: !meal.isEaten } : meal
        ),
      }))
    );
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