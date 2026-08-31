-- NutriPlan SA: Production Database Schema & Row-Level Security (RLS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT,
  sex TEXT,
  height_cm INT,
  weight_kg NUMERIC(5, 2),
  target_weight_kg NUMERIC(5, 2),
  waist_cm NUMERIC(5, 2),
  activity_level TEXT DEFAULT 'moderately_active',
  main_goal TEXT DEFAULT 'lose_weight',
  meals_per_day INT DEFAULT 2,
  dietary_preference TEXT DEFAULT 'lower_carb',
  weekly_budget TEXT DEFAULT 'R750',
  track_calories BOOLEAN DEFAULT true,
  daily_water_target_liters NUMERIC(3, 1) DEFAULT 2.0,
  calorie_target_kcal INT DEFAULT 1750,
  protein_target_grams INT DEFAULT 115,
  carbs_target_grams INT DEFAULT 65,
  fats_target_grams INT DEFAULT 85,
  foods_avoided TEXT[] DEFAULT ARRAY['Pap', 'Bread', 'Rice', 'Potatoes'],
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  prep_time_minutes INT DEFAULT 15,
  cook_time_minutes INT DEFAULT 15,
  difficulty TEXT DEFAULT 'Easy',
  servings INT DEFAULT 1,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  calories INT NOT NULL,
  protein_g NUMERIC(5, 1) NOT NULL,
  carbs_g NUMERIC(5, 1) NOT NULL,
  fat_g NUMERIC(5, 1) NOT NULL,
  fiber_g NUMERIC(5, 1),
  estimated_cost_zar NUMERIC(6, 2),
  is_south_african_classic BOOLEAN DEFAULT false,
  ingredients JSONB NOT NULL DEFAULT '[]'::JSONB,
  instructions JSONB NOT NULL DEFAULT '[]'::JSONB,
  substitutions JSONB DEFAULT '[]'::JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.planned_meals (
  id TEXT PRIMARY KEY,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  category TEXT NOT NULL,
  recipe_id TEXT REFERENCES public.recipes(id) ON DELETE SET NULL,
  recipe_snapshot JSONB,
  is_eaten BOOLEAN DEFAULT false,
  eaten_at TIMESTAMPTZ,
  why_this_meal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INT NOT NULL DEFAULT 0,
  target_ml INT NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.habits (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  reminder_time TEXT,
  reminder_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id TEXT REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.shopping_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(6, 2) NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_cost_zar NUMERIC(6, 2) DEFAULT 0,
  is_checked BOOLEAN DEFAULT false,
  is_already_have BOOLEAN DEFAULT false,
  associated_recipe_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pantry_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Pantry',
  is_common BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  waist_cm NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  water_reminders BOOLEAN DEFAULT true,
  water_interval_hours INT DEFAULT 2,
  water_start_time TEXT DEFAULT '08:00',
  water_end_time TEXT DEFAULT '20:00',
  meal_reminders BOOLEAN DEFAULT true,
  shopping_alerts BOOLEAN DEFAULT true,
  movement_reminders BOOLEAN DEFAULT true,
  sleep_reminders BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '06:30',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public recipes are readable by everyone" ON public.recipes FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own planned meals" ON public.planned_meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own shopping items" ON public.shopping_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pantry items" ON public.pantry_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress entries" ON public.progress_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);