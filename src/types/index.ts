export type MainGoal = 'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'eat_healthier' | 'improve_energy';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export type DietaryPreference = 'balanced' | 'lower_carb' | 'high_protein' | 'vegetarian' | 'pescatarian';

export type CookingSkill = 'beginner' | 'intermediate' | 'confident';

export type BudgetTier = 'R500' | 'R750' | 'R1000' | 'R1500' | 'custom';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  waistCm?: number;
  activityLevel: ActivityLevel;
  mainGoal: MainGoal;
  mealsPerDay: 1 | 2 | 3 | 4;
  preferredEatingTimes: string[]; // e.g. ["18:00"] or ["12:00", "19:00"]
  dietaryPreference: DietaryPreference;
  allergies: string[];
  foodsDisliked: string[];
  foodsAvoided: string[]; // e.g. ["Pap", "Bread", "Rice", "Potatoes"]
  cookingSkill: CookingSkill;
  cookingTimeMinutes: number; // e.g. 20-30 min
  householdSize: number;
  weeklyBudget: BudgetTier;
  customBudgetValue?: number;
  trackCalories: boolean;
  dailyWaterTargetLiters: number;
  calorieTargetKcal: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatsTargetGrams: number;
  onboardingCompleted: boolean;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionalInfo {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'Meat & Protein' | 'Vegetables' | 'Fruit' | 'Dairy' | 'Pantry' | 'Spices' | 'Other';
  estimatedCostZAR: number;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Quick';
  servings: number;
  tags: string[]; // ["High Protein", "Low Carb", "Budget", "South African", "Quick"]
  imageUrl: string;
  nutrition: NutritionalInfo;
  ingredients: Ingredient[];
  instructions: string[];
  substitutions?: { original: string; replacement: string; note: string }[];
  isSouthAfricanClassic?: boolean;
  estimatedCostZAR: number;
}

export interface PlannedMeal {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string; // e.g. "12:00"
  category: MealCategory;
  recipe: Recipe;
  isEaten: boolean;
  eatenAt?: string;
  whyThisMeal: string; // Smart explanation
  swappedFromId?: string;
}

export interface DayPlan {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dateStr: string;
  meals: PlannedMeal[];
  targetCalories: number;
  totalCalories: number;
  totalProteinG: number;
  isCompleted: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'Meat & Protein' | 'Vegetables' | 'Fruit' | 'Dairy' | 'Pantry' | 'Spices' | 'Other';
  estimatedCostZAR: number;
  isChecked: boolean;
  isAlreadyHave: boolean;
  associatedRecipeTitles: string[];
}

export interface HabitItem {
  id: string;
  title: string;
  description: string;
  category: 'water' | 'vegetables' | 'meals' | 'movement' | 'sleep' | 'cooking';
  icon: string;
  isCompletedToday: boolean;
  currentStreak: number;
  weeklyAdherence: boolean[]; // 7 days Mon-Sun
  reminderEnabled: boolean;
  reminderTime?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
  targetMl: number;
  logs: { time: string; amountMl: number }[];
}

export interface ProgressMetricEntry {
  date: string;
  weightKg: number;
  waistCm?: number;
  waterAchieved: boolean;
  mealsAdherencePercent: number;
  habitsCompletedCount: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achievedDate?: string;
  isAchieved: boolean;
}

export interface NotificationPreferences {
  waterReminders: boolean;
  waterIntervalHours: number;
  waterStartTime: string; // "08:00"
  waterEndTime: string;   // "20:00"
  mealReminders: boolean;
  shoppingAlerts: boolean;
  movementReminders: boolean;
  sleepReminders: boolean;
  sleepTime: string;      // "22:00"
  progressReview: boolean;
  motivationAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "06:30"
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'Water' | 'Meals' | 'Shopping' | 'Movement' | 'Sleep' | 'Progress' | 'Motivation';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  isCommon: boolean;
}
