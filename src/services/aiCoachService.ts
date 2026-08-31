import { UserProfile, PlannedMeal, Recipe, DayPlan } from '../types';
import { getNutriCoachResponse } from './nutriCoachService';
import { generatePersonalizedMealPlan } from './mealPlannerService';
import { SA_RECIPES } from '../data/saFoodDatabase';

export interface AICoachContext {
  profile: UserProfile;
  currentMeals: PlannedMeal[];
  pantryItems: string[];
  recentHabitsCompleted: number;
}

export interface WeeklyReviewMetrics {
  mealAdherencePercent: number;
  waterAdherencePercent: number;
  habitsCompletedCount: number;
  weightChangeKg: number;
  waistChangeCm: number;
  missedMealsCount: number;
}

export const aiCoachService = {
  async askCoach(
    query: string,
    context: AICoachContext
  ): Promise<{ text: string; action?: any; isLiveAI?: boolean }> {
    const edgeFunctionUrl = import.meta.env.VITE_AI_COACH_ENDPOINT;

    if (edgeFunctionUrl) {
      try {
        const payload = {
          query,
          context: {
            userName: context.profile.name,
            goal: context.profile.mainGoal,
            currentWeightKg: context.profile.weightKg,
            targetWeightKg: context.profile.targetWeightKg,
            dietPreference: context.profile.dietaryPreference,
            mealsPerDay: context.profile.mealsPerDay,
            budget: context.profile.weeklyBudget,
            avoidedFoods: context.profile.foodsAvoided,
            allergies: context.profile.allergies,
            pantry: context.pantryItems,
            plannedMealsToday: context.currentMeals.map(m => m.recipe.title),
          },
        };

        const res = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (!data.fallbackRequired && data.reply) {
            return { text: data.reply, action: data.suggestedAction, isLiveAI: true };
          }
        }
      } catch (err) {
        console.warn('Live AI Coach endpoint unreachable, falling back to local nutrition engine:', err);
      }
    }

    // Resilient South African deterministic engine fallback
    const localResult = getNutriCoachResponse(
      query,
      context.profile,
      context.currentMeals,
      context.pantryItems
    );

    return {
      text: localResult.text,
      action: localResult.action,
      isLiveAI: false,
    };
  },

  async generateAIMealPlan(
    profile: UserProfile,
    pantryItems: string[]
  ): Promise<{ plan: DayPlan[]; isLiveAI: boolean }> {
    const edgeFunctionUrl = import.meta.env.VITE_AI_COACH_ENDPOINT;

    if (edgeFunctionUrl) {
      try {
        const query = `Generate a 7-day personalized meal plan with ${profile.mealsPerDay} meals per day for goal: ${profile.mainGoal}. Dietary style: ${profile.dietaryPreference}. Budget: ${profile.weeklyBudget}. Avoid: ${(profile.foodsAvoided || []).join(', ')}. Available recipes: ${SA_RECIPES.map(r => r.id).join(', ')}.`;
        
        const payload = {
          query,
          context: {
            userName: profile.name,
            goal: profile.mainGoal,
            dietPreference: profile.dietaryPreference,
            mealsPerDay: profile.mealsPerDay,
            budget: profile.weeklyBudget,
            avoidedFoods: profile.foodsAvoided,
            allergies: profile.allergies,
            pantry: pantryItems,
          },
          mode: 'meal_plan'
        };

        const res = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.plan && Array.isArray(data.plan) && data.plan.length === 7) {
            return { plan: data.plan, isLiveAI: true };
          }
        }
      } catch (err) {
        console.warn('Live AI Meal Plan generation failed, falling back to local planner:', err);
      }
    }

    // Deterministic fallback
    const localPlan = generatePersonalizedMealPlan(profile);
    return { plan: localPlan, isLiveAI: false };
  },

  async generateAIWeeklyReview(
    profile: UserProfile,
    metrics: WeeklyReviewMetrics
  ): Promise<{ summary: string; suggestions: string[]; isLiveAI: boolean }> {
    const edgeFunctionUrl = import.meta.env.VITE_AI_COACH_ENDPOINT;

    if (edgeFunctionUrl) {
      try {
        const query = `Provide a supportive, encouraging weekly nutrition review for ${profile.name}. Meal adherence: ${metrics.mealAdherencePercent}%, Water consistency: ${metrics.waterAdherencePercent}%, Habits completed: ${metrics.habitsCompletedCount}, Weight change: ${metrics.weightChangeKg} kg, Missed meals: ${metrics.missedMealsCount}. Provide 3 practical tips for next week.`;
        
        const payload = {
          query,
          context: {
            userName: profile.name,
            goal: profile.mainGoal,
            dietPreference: profile.dietaryPreference,
            mealsPerDay: profile.mealsPerDay,
            budget: profile.weeklyBudget,
          },
          mode: 'weekly_review'
        };

        const res = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply && !data.fallbackRequired) {
            return {
              summary: data.reply,
              suggestions: [
                'Keep drinking clean water or herbal rooibos regularly throughout the workday.',
                'Prep chicken breast and mince ahead of time to save 20 minutes on busy evenings.',
                'Enjoy your weekend braai mindfully with quality boerewors and fresh chakalaka greens.'
              ],
              isLiveAI: true
            };
          }
        }
      } catch (err) {
        console.warn('Live AI Weekly Review failed, using built-in review:', err);
      }
    }

    // Deterministic review summary
    const summary = `Solid progress this week, ${profile.name}! You achieved ${metrics.mealAdherencePercent}% meal adherence and hit ${metrics.habitsCompletedCount} healthy habits. Consistency with balanced South African whole foods is building lasting metabolic health.`;
    const suggestions = [
      'Keep drinking clean water or herbal rooibos regularly throughout the workday.',
      'Prep chicken breast and mince ahead of time to save 20 minutes on busy evenings.',
      'Enjoy your weekend braai mindfully with quality boerewors and fresh chakalaka greens.'
    ];

    return { summary, suggestions, isLiveAI: false };
  }
};