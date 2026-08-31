import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, DayPlan, ShoppingItem, HabitItem, PantryItem } from '../types';

export interface MigrationSummary {
  hasLocalData: boolean;
  profileName?: string;
  mealCount: number;
  habitsCount: number;
  pantryCount: number;
  shoppingCount: number;
}

export const migrationService = {
  detectLocalData(): MigrationSummary {
    const profileRaw = localStorage.getItem('nutriplan_profile_v1');
    const planRaw = localStorage.getItem('nutriplan_plan_v1');
    const habitsRaw = localStorage.getItem('nutriplan_habits_v1');
    const pantryRaw = localStorage.getItem('nutriplan_pantry_v1');
    const shoppingRaw = localStorage.getItem('nutriplan_shopping_v1');

    const profile: UserProfile | null = profileRaw ? JSON.parse(profileRaw) : null;
    const plan: DayPlan[] | null = planRaw ? JSON.parse(planRaw) : null;
    const habits: HabitItem[] | null = habitsRaw ? JSON.parse(habitsRaw) : null;
    const pantry: PantryItem[] | null = pantryRaw ? JSON.parse(pantryRaw) : null;
    const shopping: ShoppingItem[] | null = shoppingRaw ? JSON.parse(shoppingRaw) : null;

    let mealCount = 0;
    if (plan) {
      mealCount = plan.reduce((acc, d) => acc + d.meals.length, 0);
    }

    const hasData = Boolean(profile || mealCount > 0 || (habits && habits.length > 0));

    return {
      hasLocalData: hasData,
      profileName: profile?.name,
      mealCount,
      habitsCount: habits?.length || 0,
      pantryCount: pantry?.length || 0,
      shoppingCount: shopping?.length || 0,
    };
  },

  async migrateToCloud(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const profileRaw = localStorage.getItem('nutriplan_profile_v1');
      const planRaw = localStorage.getItem('nutriplan_plan_v1');
      const habitsRaw = localStorage.getItem('nutriplan_habits_v1');
      const pantryRaw = localStorage.getItem('nutriplan_pantry_v1');
      const shoppingRaw = localStorage.getItem('nutriplan_shopping_v1');

      if (isSupabaseConfigured) {
        // 1. Migrate Profile
        if (profileRaw) {
          const profile: UserProfile = JSON.parse(profileRaw);
          const { error: profileErr } = await supabase.from('profiles').upsert({
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
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          });
          if (profileErr) throw new Error(profileErr.message);
        }

        // 2. Migrate Meal Plan
        if (planRaw) {
          const plan: DayPlan[] = JSON.parse(planRaw);
          const { data: planRow, error: planErr } = await supabase
            .from('meal_plans')
            .upsert({
              user_id: userId,
              week_start_date: new Date().toISOString().split('T')[0],
              is_active: true,
            })
            .select('id')
            .single();

          if (!planErr && planRow) {
            const plannedMeals = plan.flatMap(d =>
              d.meals.map(m => ({
                id: m.id,
                meal_plan_id: planRow.id,
                user_id: userId,
                day_of_week: d.dayOfWeek,
                time_slot: m.time,
                category: m.category,
                recipe_id: m.recipe?.id || null,
                recipe_snapshot: m.recipe,
                is_eaten: m.isEaten,
                eaten_at: m.eatenAt || null,
                why_this_meal: m.whyThisMeal || 'Migrated choice',
              }))
            );
            if (plannedMeals.length > 0) {
              await supabase.from('planned_meals').upsert(plannedMeals);
            }
          }
        }

        // 3. Migrate Habits
        if (habitsRaw) {
          const habits: HabitItem[] = JSON.parse(habitsRaw);
          const habitRows = habits.map(h => ({
            id: h.id,
            user_id: userId,
            title: h.title,
            description: h.description,
            category: h.category,
            reminder_time: h.reminderTime || '10:00',
            reminder_enabled: h.reminderEnabled ?? true,
            is_active: true,
          }));
          if (habitRows.length > 0) {
            await supabase.from('habits').upsert(habitRows);
          }
        }

        // 4. Migrate Pantry
        if (pantryRaw) {
          const pantry: PantryItem[] = JSON.parse(pantryRaw);
          const pantryRows = pantry.map(p => ({
            id: p.id,
            user_id: userId,
            name: p.name,
            category: p.category,
            is_common: p.isCommon,
          }));
          if (pantryRows.length > 0) {
            await supabase.from('pantry_items').upsert(pantryRows);
          }
        }

        // 5. Migrate Shopping List
        if (shoppingRaw) {
          const shopping: ShoppingItem[] = JSON.parse(shoppingRaw);
          const shoppingRows = shopping.map(s => ({
            id: s.id,
            user_id: userId,
            name: s.name,
            quantity: s.quantity,
            unit: s.unit,
            category: s.category,
            estimated_cost_zar: s.estimatedCostZAR,
            is_checked: s.isChecked,
            is_already_have: s.isAlreadyHave,
            associated_recipe_title: s.associatedRecipeTitles?.[0] || '',
          }));
          if (shoppingRows.length > 0) {
            await supabase.from('shopping_items').upsert(shoppingRows);
          }
        }
      }

      localStorage.setItem('nutriplan_migrated_user', userId);
      return { success: true };
    } catch (err: any) {
      console.error('Migration error:', err);
      return { success: false, error: err.message || 'Migration failed' };
    }
  },
};