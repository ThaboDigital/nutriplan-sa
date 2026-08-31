import { DayPlan, ShoppingItem, Ingredient } from '../types';

export function generateShoppingListFromMealPlan(weeklyPlan: DayPlan[], existingPantryNames: string[] = []): ShoppingItem[] {
  const aggregated: Record<string, {
    name: string;
    quantity: number;
    unit: string;
    category: ShoppingItem['category'];
    estimatedCostZAR: number;
    recipeTitles: Set<string>;
  }> = {};

  const pantryLookup = new Set(existingPantryNames.map(p => p.toLowerCase().trim()));

  weeklyPlan.forEach(day => {
    day.meals.forEach(meal => {
      meal.recipe.ingredients.forEach(ing => {
        const normName = ing.name.toLowerCase().trim();
        // Key by normalized name and unit
        const key = `${normName}_${ing.unit.toLowerCase()}`;

        if (!aggregated[key]) {
          aggregated[key] = {
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category,
            estimatedCostZAR: ing.estimatedCostZAR,
            recipeTitles: new Set([meal.recipe.title]),
          };
        } else {
          aggregated[key].quantity += ing.quantity;
          aggregated[key].estimatedCostZAR += ing.estimatedCostZAR * 0.85; // slight bulk discount simulation
          aggregated[key].recipeTitles.add(meal.recipe.title);
        }
      });
    });
  });

  return Object.entries(aggregated).map(([key, data], idx) => {
    const isAlreadyHave = pantryLookup.has(data.name.toLowerCase().trim()) ||
      Array.from(pantryLookup).some(p => data.name.toLowerCase().includes(p) || p.includes(data.name.toLowerCase()));

    return {
      id: `shop_${idx}_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: data.name,
      quantity: Math.round(data.quantity * 10) / 10,
      unit: data.unit,
      category: data.category,
      estimatedCostZAR: Math.round(data.estimatedCostZAR),
      isChecked: false,
      isAlreadyHave,
      associatedRecipeTitles: Array.from(data.recipeTitles),
    };
  });
}
