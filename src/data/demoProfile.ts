import { UserProfile, DayPlan, HabitItem, AppNotification, Milestone, PantryItem } from '../types';
import { SA_RECIPES } from './saFoodDatabase';

export const DEMO_PROFILE: UserProfile = {
  id: 'user_thabo_01',
  name: 'Thabo',
  age: 34,
  sex: 'male',
  heightCm: 178,
  weightKg: 89.5,
  targetWeightKg: 82.0,
  waistCm: 96,
  activityLevel: 'moderately_active',
  mainGoal: 'lose_weight',
  mealsPerDay: 2,
  preferredEatingTimes: ['12:00', '19:00'],
  dietaryPreference: 'lower_carb',
  allergies: ['Peanuts'],
  foodsDisliked: ['Anchovies', 'Liver'],
  foodsAvoided: ['Pap', 'Bread', 'Rice', 'Potatoes'],
  cookingSkill: 'intermediate',
  cookingTimeMinutes: 25,
  householdSize: 2,
  weeklyBudget: 'R750',
  trackCalories: true,
  dailyWaterTargetLiters: 2.0,
  calorieTargetKcal: 1750,
  proteinTargetGrams: 115,
  carbsTargetGrams: 65,
  fatsTargetGrams: 85,
  onboardingCompleted: true,
};

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'hab_water',
    title: 'Drink 2.0 L Water',
    description: 'Stay hydrated throughout the day with clean water or herbal rooibos',
    category: 'water',
    icon: 'Droplets',
    isCompletedToday: false, // will update when water reaches target
    currentStreak: 5,
    weeklyAdherence: [true, true, true, true, false, false, false],
    reminderEnabled: true,
    reminderTime: '10:00',
  },
  {
    id: 'hab_veggies',
    title: 'Eat 2+ Servings of Green Veggies',
    description: 'Morogo, cabbage, broccoli, green beans, or garden salad',
    category: 'vegetables',
    icon: 'Salad',
    isCompletedToday: true,
    currentStreak: 8,
    weeklyAdherence: [true, true, true, true, true, false, false],
    reminderEnabled: true,
    reminderTime: '18:00',
  },
  {
    id: 'hab_meals',
    title: 'Stick to Planned Meals',
    description: 'Enjoy your 12:00 and 19:00 prepared meals without random snacking',
    category: 'meals',
    icon: 'UtensilsCrossed',
    isCompletedToday: true,
    currentStreak: 4,
    weeklyAdherence: [true, true, true, true, false, false, false],
    reminderEnabled: true,
    reminderTime: '11:45',
  },
  {
    id: 'hab_cook',
    title: 'Cook at Home',
    description: 'Prepare fresh whole ingredients instead of takeaway food',
    category: 'cooking',
    icon: 'Flame',
    isCompletedToday: true,
    currentStreak: 6,
    weeklyAdherence: [true, true, true, true, true, false, false],
    reminderEnabled: false,
  },
  {
    id: 'hab_walk',
    title: '25-Min Brisk Walk / Movement',
    description: 'Fresh air walk during lunch break or after work',
    category: 'movement',
    icon: 'Footprints',
    isCompletedToday: false,
    currentStreak: 3,
    weeklyAdherence: [false, true, true, true, false, false, false],
    reminderEnabled: true,
    reminderTime: '17:30',
  },
  {
    id: 'hab_sleep',
    title: 'Sleep by 22:30',
    description: 'Consistent sleep schedule supports insulin sensitivity and weight loss',
    category: 'sleep',
    icon: 'Moon',
    isCompletedToday: false,
    currentStreak: 4,
    weeklyAdherence: [true, true, true, true, false, false, false],
    reminderEnabled: true,
    reminderTime: '22:00',
  },
];

export const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p_1', name: 'Chicken breast fillets', category: 'Meat & Protein', isCommon: true },
  { id: 'p_2', name: 'Lean beef mince', category: 'Meat & Protein', isCommon: true },
  { id: 'p_3', name: 'Eggs', category: 'Dairy', isCommon: true },
  { id: 'p_4', name: 'Green cabbage', category: 'Vegetables', isCommon: true },
  { id: 'p_5', name: 'Ripe avocados', category: 'Fruit', isCommon: true },
  { id: 'p_6', name: 'Onions & Garlic', category: 'Vegetables', isCommon: true },
  { id: 'p_7', name: 'Olive oil', category: 'Pantry', isCommon: true },
  { id: 'p_8', name: 'Rooibos tea', category: 'Pantry', isCommon: true },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: '?? Hydration Check',
    message: 'Time for some water. You are 750 ml away from today�s target.',
    category: 'Water',
    timestamp: '25m ago',
    isRead: false,
  },
  {
    id: 'notif_2',
    title: '?? Lunch Coming Up (12:00)',
    message: 'Today: Chicken & Avocado Green Salad. Fresh, high-protein & 15m prep.',
    category: 'Meals',
    timestamp: '2h ago',
    isRead: true,
  },
  {
    id: 'notif_3',
    title: '?? Shopping List Ready',
    message: 'Weekly groceries estimated at R640 (well within your R750 budget).',
    category: 'Shopping',
    timestamp: '1d ago',
    isRead: true,
  },
  {
    id: 'notif_4',
    title: '?? 5-Day Water Streak!',
    message: 'Fantastic consistency Thabo. Your energy and recovery are benefiting.',
    category: 'Progress',
    timestamp: '1d ago',
    isRead: true,
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'm_1',
    title: 'First 7 Days Completed',
    description: 'Logged your meals and planned ahead for one solid week.',
    icon: 'Trophy',
    achievedDate: '28 Aug 2026',
    isAchieved: true,
  },
  {
    id: 'm_2',
    title: '10 Water Targets Met',
    description: 'Drank your full daily water goal 10 times.',
    icon: 'Droplets',
    achievedDate: '26 Aug 2026',
    isAchieved: true,
  },
  {
    id: 'm_3',
    title: 'Lower-Carb Pioneer',
    description: 'Successfully swapped high-carb staples for healthy greens 14 times.',
    icon: 'Salad',
    achievedDate: '29 Aug 2026',
    isAchieved: true,
  },
  {
    id: 'm_4',
    title: 'Pantry Pro Chef',
    description: 'Cooked 5 meals directly from ingredients already in your pantry.',
    icon: 'Sparkles',
    isAchieved: false,
  },
  {
    id: 'm_5',
    title: '20 Clean Meals Logged',
    description: 'Kept consistent food diary records for 20 healthy meals.',
    icon: 'Award',
    isAchieved: false,
  }
];

export function buildDemoSevenDayPlan(): DayPlan[] {
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const recipeMap: Record<string, typeof SA_RECIPES[0]> = {};
  SA_RECIPES.forEach(r => { recipeMap[r.id] = r; });

  const weeklySchedule = [
    {
      day: 'Monday',
      date: '2026-08-31',
      meals: [
        { recipeId: 'rec_chicken_avo_salad', time: '12:00', why: 'High protein, fits 20m lunch break, avoids afternoon slump' },
        { recipeId: 'rec_beef_mince_cabbage', time: '19:00', why: 'Budget-friendly staple using your pantry cabbage and lean mince' }
      ]
    },
    {
      day: 'Tuesday',
      date: '2026-09-01',
      meals: [
        { recipeId: 'rec_eggs_avo_greens', time: '12:00', why: 'Quick 10m prep with free-range eggs and avocado' },
        { recipeId: 'rec_peri_peri_chicken_veg', time: '19:00', why: 'Vibrant local peri-peri flavours with vitamin-A rich butternut' }
      ]
    },
    {
      day: 'Wednesday',
      date: '2026-09-02',
      meals: [
        { recipeId: 'rec_tuna_gem_squash', time: '12:00', why: 'Budget winner at under R40, high fibre and satisfying' },
        { recipeId: 'rec_grilled_chicken_morogo', time: '19:00', why: 'Traditional morogo greens paired with creamy cauliflower mash' }
      ]
    },
    {
      day: 'Thursday',
      date: '2026-09-03',
      meals: [
        { recipeId: 'rec_chicken_avo_salad', time: '12:00', why: 'Uses batch-cooked chicken fillet from Monday for zero waste' },
        { recipeId: 'rec_grilled_hake_lemon', time: '19:00', why: 'Omega-3 rich Cape Hake, light dinner for optimal sleep' }
      ]
    },
    {
      day: 'Friday',
      date: '2026-09-04',
      meals: [
        { recipeId: 'rec_beef_mince_cabbage', time: '12:00', why: 'Satisfying hot lunch packed with 38g clean protein' },
        { recipeId: 'rec_beef_stew_green_beans', time: '19:00', why: 'Hearty Friday night potjie flavour without heavy flour sauce' }
      ]
    },
    {
      day: 'Saturday',
      date: '2026-09-05',
      meals: [
        { recipeId: 'rec_eggs_avo_greens', time: '12:00', why: 'Relaxed weekend brunch with creamy avocado & blistered tomatoes' },
        { recipeId: 'rec_boerewors_chakalaka_greens', time: '19:00', why: 'South African weekend braai favourite: portioned wors & chakalaka' }
      ]
    },
    {
      day: 'Sunday',
      date: '2026-09-06',
      meals: [
        { recipeId: 'rec_lentil_chickpea_curry', time: '12:00', why: 'Durban-style spiced lentil pot with comforting warm spices' },
        { recipeId: 'rec_peri_peri_chicken_veg', time: '19:00', why: 'High protein dinner to prep your body for a strong upcoming week' }
      ]
    }
  ];

  return weeklySchedule.map(item => {
    const plannedMeals = item.meals.map((m, idx) => {
      const rec = recipeMap[m.recipeId] || SA_RECIPES[0];
      return {
        id: `plan_${item.day}_${idx}`,
        dayOfWeek: item.day as any,
        time: m.time,
        category: (idx === 0 ? 'lunch' : 'dinner') as any,
        recipe: rec,
        isEaten: item.day === 'Monday' && idx === 0 ? true : false,
        eatenAt: item.day === 'Monday' && idx === 0 ? '12:15' : undefined,
        whyThisMeal: m.why,
      };
    });

    const totalKcal = plannedMeals.reduce((acc, pm) => acc + pm.recipe.nutrition.calories, 0);
    const totalProt = plannedMeals.reduce((acc, pm) => acc + pm.recipe.nutrition.proteinG, 0);

    return {
      dayOfWeek: item.day as any,
      dateStr: item.date,
      meals: plannedMeals,
      targetCalories: 1750,
      totalCalories: totalKcal,
      totalProteinG: totalProt,
      isCompleted: false,
    };
  });
}
