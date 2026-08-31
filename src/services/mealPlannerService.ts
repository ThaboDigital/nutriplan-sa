import { UserProfile, DayPlan, PlannedMeal, Recipe } from '../types';
import { SA_RECIPES } from '../data/saFoodDatabase';

export function generatePersonalizedMealPlan(profile: UserProfile): DayPlan[] {
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Filter recipes according to user allergies and avoided foods
  let candidateRecipes = SA_RECIPES.filter(r => {
    // Check allergies
    const hasAllergen = profile.allergies.some(a =>
      r.ingredients.some(ing => ing.name.toLowerCase().includes(a.toLowerCase()))
    );
    if (hasAllergen) return false;

    // Check dietary preference
    if (profile.dietaryPreference === 'lower_carb') {
      // Prioritize low-carb / balanced
      if (r.tags.includes('Low Carb') || r.nutrition.carbsG <= 25) return true;
    }
    return true;
  });

  if (candidateRecipes.length < 4) {
    candidateRecipes = SA_RECIPES;
  }

  const mealTimes = profile.preferredEatingTimes && profile.preferredEatingTimes.length > 0
    ? profile.preferredEatingTimes
    : profile.mealsPerDay === 1
      ? ['18:00']
      : profile.mealsPerDay === 2
        ? ['12:00', '19:00']
        : ['08:00', '13:00', '19:00'];

  const now = new Date();

  return days.map((day, dIdx) => {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + dIdx);
    const dateStr = dayDate.toISOString().split('T')[0];

    const plannedMeals: PlannedMeal[] = [];

    for (let mIdx = 0; mIdx < profile.mealsPerDay; mIdx++) {
      const time = mealTimes[mIdx] || (profile.mealsPerDay === 1 ? '18:00' : mIdx === 0 ? '12:00' : '19:00');
      const recipeIndex = (dIdx * 2 + mIdx) % candidateRecipes.length;
      const rec = candidateRecipes[recipeIndex];

      let category: PlannedMeal['category'] = 'dinner';
      if (profile.mealsPerDay === 1) {
        category = 'dinner';
      } else if (mIdx === 0 && profile.mealsPerDay >= 3) {
        category = 'breakfast';
      } else if (mIdx === 0 && profile.mealsPerDay === 2) {
        category = 'lunch';
      } else if (mIdx === profile.mealsPerDay - 1) {
        category = 'dinner';
      } else {
        category = 'lunch';
      }

      plannedMeals.push({
        id: `plan_${day}_${mIdx}_${Date.now().toString().slice(-4)}`,
        dayOfWeek: day,
        time,
        category,
        recipe: rec,
        isEaten: false,
        whyThisMeal: `Optimized for ${profile.dietaryPreference.replace('_', ' ')}, ${rec.prepTimeMinutes + rec.cookTimeMinutes}m total time, and budget alignment.`,
      });
    }

    const totalKcal = plannedMeals.reduce((acc, m) => acc + m.recipe.nutrition.calories, 0);
    const totalProt = plannedMeals.reduce((acc, m) => acc + m.recipe.nutrition.proteinG, 0);

    return {
      dayOfWeek: day,
      dateStr,
      meals: plannedMeals,
      targetCalories: profile.calorieTargetKcal,
      totalCalories: totalKcal,
      totalProteinG: totalProt,
      isCompleted: false,
    };
  });
}

export function swapMealInPlan(
  weeklyPlan: DayPlan[],
  targetMealId: string,
  newRecipe: Recipe
): DayPlan[] {
  return weeklyPlan.map(day => {
    const updatedMeals = day.meals.map(meal => {
      if (meal.id === targetMealId) {
        return {
          ...meal,
          recipe: newRecipe,
          whyThisMeal: `Hand-selected swap: ${newRecipe.title}`,
          swappedFromId: meal.recipe.id,
        };
      }
      return meal;
    });

    const totalKcal = updatedMeals.reduce((acc, m) => acc + m.recipe.nutrition.calories, 0);
    const totalProt = updatedMeals.reduce((acc, m) => acc + m.recipe.nutrition.proteinG, 0);

    return {
      ...day,
      meals: updatedMeals,
      totalCalories: totalKcal,
      totalProteinG: totalProt,
    };
  });
}
