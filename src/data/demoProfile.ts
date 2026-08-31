import { UserProfile, DayPlan, HabitItem, AppNotification, Milestone, PantryItem } from '../types';
import { SA_RECIPES } from './saFoodDatabase';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'guest_user',
  name: 'New User',
  age: 28,
  sex: 'female',
  heightCm: 168,
  weightKg: 72.0,
  targetWeightKg: 65.0,
  waistCm: 82,
  activityLevel: 'moderately_active',
  mainGoal: 'eat_healthier',
  mealsPerDay: 3,
  preferredEatingTimes: ['08:00', '13:00', '19:00'],
  dietaryPreference: 'balanced',
  allergies: [],
  foodsDisliked: [],
  foodsAvoided: [],
  cookingSkill: 'beginner',
  cookingTimeMinutes: 30,
  householdSize: 1,
  weeklyBudget: 'R750',
  trackCalories: true,
  dailyWaterTargetLiters: 2.0,
  calorieTargetKcal: 1900,
  proteinTargetGrams: 100,
  carbsTargetGrams: 140,
  fatsTargetGrams: 60,
  onboardingCompleted: false,
};

export const DEFAULT_HABITS: HabitItem[] = [
  {
    id: 'hab_water',
    title: 'Drink 2.0 L Water',
    description: 'Stay hydrated with clean water or herbal Rooibos',
    category: 'water',
    icon: 'Droplets',
    isCompletedToday: false,
    currentStreak: 0,
    weeklyAdherence: [false, false, false, false, false, false, false],
    reminderEnabled: true,
    reminderTime: '10:00',
  },
  {
    id: 'hab_veggies',
    title: 'Eat 2+ Servings of Vegetables',
    description: 'Fresh vegetables or garden salad with lunch & dinner',
    category: 'vegetables',
    icon: 'Salad',
    isCompletedToday: false,
    currentStreak: 0,
    weeklyAdherence: [false, false, false, false, false, false, false],
    reminderEnabled: true,
    reminderTime: '18:00',
  },
  {
    id: 'hab_meals',
    title: 'Stick to Planned Meals',
    description: 'Enjoy your prepared healthy meals without unplanned snacking',
    category: 'meals',
    icon: 'UtensilsCrossed',
    isCompletedToday: false,
    currentStreak: 0,
    weeklyAdherence: [false, false, false, false, false, false, false],
    reminderEnabled: true,
    reminderTime: '12:00',
  },
  {
    id: 'hab_cook',
    title: 'Cook at Home',
    description: 'Prepare fresh whole ingredients instead of takeaways',
    category: 'cooking',
    icon: 'Flame',
    isCompletedToday: false,
    currentStreak: 0,
    weeklyAdherence: [false, false, false, false, false, false, false],
    reminderEnabled: false,
  },
  {
    id: 'hab_walk',
    title: '20-Min Daily Movement / Walk',
    description: 'Fresh air walk or light exercise',
    category: 'movement',
    icon: 'Footprints',
    isCompletedToday: false,
    currentStreak: 0,
    weeklyAdherence: [false, false, false, false, false, false, false],
    reminderEnabled: true,
    reminderTime: '17:30',
  },
];

export const DEFAULT_PANTRY: PantryItem[] = [];

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_welcome',
    title: 'Welcome to NutriPlan SA',
    message: 'Take the 1-minute Health Questionnaire to set your real age, weight, and meal goals.',
    category: 'General',
    timestamp: 'Just now',
    isRead: false,
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'mile_1',
    title: 'First Day Completed',
    description: 'Logged your meals and met daily nutrition targets',
    isUnlocked: false,
    category: 'consistency',
  },
  {
    id: 'mile_2',
    title: 'Hydration Hero',
    description: 'Hit 2.0L water goal for 3 consecutive days',
    isUnlocked: false,
    category: 'water',
  },
  {
    id: 'mile_3',
    title: 'Budget Master',
    description: 'Completed a week of wholesome cooking within grocery budget',
    isUnlocked: false,
    category: 'budget',
  },
  {
    id: 'mile_4',
    title: '1 kg Closer to Target',
    description: 'Healthy, steady progress towards your personal weight goal',
    isUnlocked: false,
    category: 'weight',
  },
];