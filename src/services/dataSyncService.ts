import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  UserProfile,
  DayPlan,
  HabitItem,
  PantryItem,
  ShoppingItem,
  NotificationPreferences,
  AppNotification,
  PlannedMeal,
  Recipe
} from '../types';
import { SA_RECIPES } from '../data/saFoodDatabase';

export interface CloudUserData {
  profile: UserProfile | null;
  weeklyPlan: DayPlan[] | null;
  todayWaterMl: number | null;
  habits: HabitItem[] | null;
  pantryItems: PantryItem[] | null;
  shoppingList: ShoppingItem[] | null;
  notificationPreferences: NotificationPreferences | null;
  notifications: AppNotification[] | null;
}

export const dataSyncService = {
  async loadAllUserData(userId: string): Promise<CloudUserData> {
    if (!isSupabaseConfigured || !userId) {
      return {
        profile: null,
        weeklyPlan: null,
        todayWaterMl: null,
        habits: null,
        pantryItems: null,
        shoppingList: null,
        notificationPreferences: null,
        notifications: null,
      };
    }

    try {
      // 1. Fetch Profile
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let profile: UserProfile | null = null;
      if (profileRow) {
        profile = {
          id: profileRow.id,
          name: profileRow.name,
          age: profileRow.age || 30,
          sex: profileRow.sex || 'other',
          heightCm: profileRow.height_cm || 175,
          weightKg: Number(profileRow.weight_kg) || 80,
          targetWeightKg: Number(profileRow.target_weight_kg) || 75,
          waistCm: Number(profileRow.waist_cm) || 90,
          activityLevel: profileRow.activity_level || 'moderately_active',
          mainGoal: profileRow.main_goal || 'lose_weight',
          mealsPerDay: profileRow.meals_per_day || 2,
          preferredEatingTimes: ['12:30', '19:00'],
          dietaryPreference: profileRow.dietary_preference || 'lower_carb',
          allergies: profileRow.allergies || [],
          foodsDisliked: [],
          foodsAvoided: profileRow.foods_avoided || ['Pap', 'Bread', 'Rice', 'Potatoes'],
          cookingSkill: 'intermediate',
          cookingTimeMinutes: 25,
          householdSize: 1,
          weeklyBudget: profileRow.weekly_budget || 'R750',
          trackCalories: profileRow.track_calories ?? true,
          dailyWaterTargetLiters: Number(profileRow.daily_water_target_liters) || 2.0,
          calorieTargetKcal: profileRow.calorie_target_kcal || 1750,
          proteinTargetGrams: profileRow.protein_target_grams || 115,
          carbsTargetGrams: profileRow.carbs_target_grams || 65,
          fatsTargetGrams: profileRow.fats_target_grams || 85,
          onboardingCompleted: profileRow.onboarding_completed ?? true,
        };
      }

      // 2. Fetch Active Meal Plan & Planned Meals
      const { data: planRows } = await supabase
        .from('meal_plans')
        .select('*, planned_meals(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      let weeklyPlan: DayPlan[] | null = null;
      if (planRows && planRows.length > 0 && planRows[0].planned_meals?.length > 0) {
        const rawMeals = planRows[0].planned_meals as any[];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
        const now = new Date();

        weeklyPlan = days.map((day, dIdx) => {
          const dayDate = new Date(now);
          dayDate.setDate(now.getDate() + dIdx);
          const dateStr = dayDate.toISOString().split('T')[0];

          const dayMealsRaw = rawMeals.filter(m => m.day_of_week === day);
          const meals: PlannedMeal[] = dayMealsRaw.map((m, mIdx) => {
            const matchedRecipe = SA_RECIPES.find(r => r.id === m.recipe_id) || SA_RECIPES[0];
            return {
              id: m.id,
              dayOfWeek: day,
              time: m.time_slot || (mIdx === 0 ? '12:30' : '19:00'),
              category: (m.category?.toLowerCase() as any) || 'lunch',
              recipe: m.recipe_snapshot || matchedRecipe,
              isEaten: m.is_eaten || false,
              eatenAt: m.eaten_at,
              whyThisMeal: m.why_this_meal || 'Balanced healthy choice',
            };
          });

          const totalCalories = meals.reduce((sum, m) => sum + (m.recipe?.nutrition?.calories || 0), 0);
          const totalProteinG = meals.reduce((sum, m) => sum + (m.recipe?.nutrition?.proteinG || 0), 0);
          const allEaten = meals.length > 0 && meals.every(m => m.isEaten);

          return {
            dayOfWeek: day,
            dateStr,
            meals,
            targetCalories: profile?.calorieTargetKcal || 1750,
            totalCalories,
            totalProteinG,
            isCompleted: allEaten,
          };
        });
      }

      // 3. Fetch Today's Water Log
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: waterRow } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', todayStr)
        .maybeSingle();

      const todayWaterMl = waterRow ? waterRow.amount_ml : null;

      // 4. Fetch Habits and today's Habit Logs
      const { data: habitRows } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      const { data: habitLogRows } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', todayStr);

      let habits: HabitItem[] | null = null;
      if (habitRows && habitRows.length > 0) {
        habits = habitRows.map(h => {
          const isDone = habitLogRows?.some(l => l.habit_id === h.id && l.is_completed) || false;
          return {
            id: h.id,
            title: h.title,
            description: h.description || '',
            category: (h.category as any) || 'nutrition',
            icon: 'Activity',
            isCompletedToday: isDone,
            currentStreak: 3,
            weeklyAdherence: [true, true, true, false, false, false, false],
            reminderEnabled: h.reminder_enabled ?? true,
            reminderTime: h.reminder_time || '10:00',
          };
        });
      }

      // 5. Fetch Pantry Items
      const { data: pantryRows } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', userId);

      let pantryItems: PantryItem[] | null = null;
      if (pantryRows && pantryRows.length > 0) {
        pantryItems = pantryRows.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category || 'Pantry',
          isCommon: p.is_common ?? false,
        }));
      }

      // 6. Fetch Shopping Items
      const { data: shoppingRows } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', userId);

      let shoppingList: ShoppingItem[] | null = null;
      if (shoppingRows && shoppingRows.length > 0) {
        shoppingList = shoppingRows.map(s => ({
          id: s.id,
          name: s.name,
          quantity: Number(s.quantity) || 1,
          unit: s.unit || 'pack',
          category: s.category as any || 'Other',
          estimatedCostZAR: Number(s.estimated_cost_zar) || 0,
          isChecked: s.is_checked ?? false,
          isAlreadyHave: s.is_already_have ?? false,
          associatedRecipeTitles: s.associated_recipe_title ? [s.associated_recipe_title] : [],
        }));
      }

      // 7. Fetch Notification Preferences
      const { data: prefRow } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let notificationPreferences: NotificationPreferences | null = null;
      if (prefRow) {
        notificationPreferences = {
          waterReminders: prefRow.water_reminders ?? true,
          waterIntervalHours: prefRow.water_interval_hours || 2,
          waterStartTime: prefRow.water_start_time || '08:00',
          waterEndTime: prefRow.water_end_time || '20:00',
          mealReminders: prefRow.meal_reminders ?? true,
          shoppingAlerts: prefRow.shopping_alerts ?? true,
          movementReminders: prefRow.movement_reminders ?? true,
          sleepReminders: prefRow.sleep_reminders ?? true,
          sleepTime: '22:00',
          progressReview: true,
          motivationAlerts: true,
          quietHoursEnabled: prefRow.quiet_hours_enabled ?? true,
          quietHoursStart: prefRow.quiet_hours_start || '22:00',
          quietHoursEnd: prefRow.quiet_hours_end || '06:30',
        };
      }

      return {
        profile,
        weeklyPlan,
        todayWaterMl,
        habits,
        pantryItems,
        shoppingList,
        notificationPreferences,
        notifications: null,
      };
    } catch (err) {
      console.warn('Error loading user data from Supabase:', err);
      return {
        profile: null,
        weeklyPlan: null,
        todayWaterMl: null,
        habits: null,
        pantryItems: null,
        shoppingList: null,
        notificationPreferences: null,
        notifications: null,
      };
    }
  },

  async syncProfile(userId: string, profile: UserProfile): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        name: profile.name,
        age: profile.age,
        sex: profile.sex,
        height_cm: profile.heightCm,
        weight_kg: profile.weightKg,
        target_weight_kg: profile.targetWeightKg,
        waist_cm: profile.waistCm,
        activity_level: profile.activityLevel,
        main_goal: profile.mainGoal,
        meals_per_day: profile.mealsPerDay,
        dietary_preference: profile.dietaryPreference,
        weekly_budget: profile.weeklyBudget,
        track_calories: profile.trackCalories,
        daily_water_target_liters: profile.dailyWaterTargetLiters,
        calorie_target_kcal: profile.calorieTargetKcal,
        protein_target_grams: profile.proteinTargetGrams,
        carbs_target_grams: profile.carbsTargetGrams,
        fats_target_grams: profile.fatsTargetGrams,
        foods_avoided: profile.foodsAvoided,
        allergies: profile.allergies,
        onboarding_completed: profile.onboardingCompleted,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to sync profile to cloud:', e);
    }
  },

  async syncWater(userId: string, amountMl: number, targetMl: number = 2000): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await supabase.from('water_logs').upsert({
        user_id: userId,
        log_date: todayStr,
        amount_ml: amountMl,
        target_ml: targetMl,
      }, { onConflict: 'user_id,log_date' });
    } catch (e) {
      console.warn('Failed to sync water log to cloud:', e);
    }
  },

  async syncMealEaten(userId: string, mealId: string, isEaten: boolean): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      await supabase.from('planned_meals').update({
        is_eaten: isEaten,
        eaten_at: isEaten ? new Date().toISOString() : null,
      }).eq('id', mealId).eq('user_id', userId);
    } catch (e) {
      console.warn('Failed to sync meal status to cloud:', e);
    }
  },

  async syncHabitToggle(userId: string, habitId: string, isCompleted: boolean): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await supabase.from('habit_logs').upsert({
        habit_id: habitId,
        user_id: userId,
        log_date: todayStr,
        is_completed: isCompleted,
      }, { onConflict: 'habit_id,user_id,log_date' });
    } catch (e) {
      console.warn('Failed to sync habit toggle to cloud:', e);
    }
  },

  async syncPantryItem(userId: string, item: PantryItem, action: 'add' | 'remove'): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      if (action === 'add') {
        await supabase.from('pantry_items').upsert({
          id: item.id,
          user_id: userId,
          name: item.name,
          category: item.category,
          is_common: item.isCommon,
        });
      } else {
        await supabase.from('pantry_items').delete().eq('id', item.id).eq('user_id', userId);
      }
    } catch (e) {
      console.warn('Failed to sync pantry item to cloud:', e);
    }
  },

  async syncShoppingItem(userId: string, item: ShoppingItem, action: 'upsert' | 'delete'): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      if (action === 'upsert') {
        await supabase.from('shopping_items').upsert({
          id: item.id,
          user_id: userId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          estimated_cost_zar: item.estimatedCostZAR,
          is_checked: item.isChecked,
          is_already_have: item.isAlreadyHave,
          associated_recipe_title: item.associatedRecipeTitles?.[0] || '',
        });
      } else {
        await supabase.from('shopping_items').delete().eq('id', item.id).eq('user_id', userId);
      }
    } catch (e) {
      console.warn('Failed to sync shopping item to cloud:', e);
    }
  },

  async syncEntireMealPlan(userId: string, plan: DayPlan[]): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      const { data: existingPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1);

      let planId: string;
      if (existingPlans && existingPlans.length > 0) {
        planId = existingPlans[0].id;
      } else {
        const { data: newPlan } = await supabase
          .from('meal_plans')
          .insert({
            user_id: userId,
            week_start_date: new Date().toISOString().split('T')[0],
            is_active: true,
          })
          .select('id')
          .single();
        planId = newPlan?.id;
      }

      if (!planId) return;

      const mealsToUpsert = plan.flatMap(day =>
        day.meals.map(m => ({
          id: m.id,
          meal_plan_id: planId,
          user_id: userId,
          day_of_week: day.dayOfWeek,
          time_slot: m.time,
          category: m.category,
          recipe_id: m.recipe?.id || null,
          recipe_snapshot: m.recipe,
          is_eaten: m.isEaten,
          eaten_at: m.eatenAt || null,
          why_this_meal: m.whyThisMeal || 'Balanced meal',
        }))
      );

      await supabase.from('planned_meals').upsert(mealsToUpsert);
    } catch (e) {
      console.warn('Failed to sync entire meal plan to cloud:', e);
    }
  },

  async migrateLocalDataToCloud(userId: string, data: {
    profile: UserProfile;
    weeklyPlan: DayPlan[];
    todayWaterMl: number;
    habits: HabitItem[];
    pantryItems: PantryItem[];
    shoppingList: ShoppingItem[];
    notificationPreferences: NotificationPreferences;
  }): Promise<void> {
    if (!isSupabaseConfigured || !userId) return;
    try {
      if (data.profile) await this.syncProfile(userId, data.profile);
      if (data.weeklyPlan && data.weeklyPlan.length > 0) await this.syncEntireMealPlan(userId, data.weeklyPlan);
      if (data.todayWaterMl !== undefined) await this.syncWater(userId, data.todayWaterMl, (data.profile?.dailyWaterTargetLiters || 2.0) * 1000);
      if (data.habits) {
        for (const h of data.habits) {
          if (h.isCompletedToday) await this.syncHabitToggle(userId, h.id, true);
        }
      }
      if (data.pantryItems) {
        for (const p of data.pantryItems) {
          await this.syncPantryItem(userId, p, 'add');
        }
      }
      if (data.shoppingList) {
        for (const s of data.shoppingList) {
          await this.syncShoppingItem(userId, s, 'upsert');
        }
      }
    } catch (e) {
      console.warn('Failed migrating local data to cloud:', e);
    }
  }
};