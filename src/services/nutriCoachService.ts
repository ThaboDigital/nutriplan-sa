import { UserProfile, Recipe, PlannedMeal } from '../types';
import { SA_RECIPES } from '../data/saFoodDatabase';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  imageUrl?: string | null;
  suggestedAction?: {
    label: string;
    type: 'swap_meal' | 'view_recipe' | 'add_pantry' | 'open_shopping' | 'create_meal_plan' | 'suggest_recipe';
    payload?: any;
  };
}

/**
 * Expert South African Nutrition Knowledge Base & Intelligent Response Engine
 */
export function getNutriCoachResponse(
  query: string,
  userProfile: UserProfile,
  currentMealPlan: PlannedMeal[] = [],
  pantryItems: string[] = []
): { text: string; action?: CoachMessage['suggestedAction'] } {
  const q = query.toLowerCase().trim();

  // 1. GREETINGS & INTRO
  if (/^(hi|hello|hey|sawubona|dumela|molo|greetings|howzit|good morning|good afternoon|good evening)/i.test(q)) {
    return {
      text: `Sawubona, ${userProfile.name}! I am your NutriCoach. 

I can help you with:
• **Affordable meal swaps** for dinner or lunch
• **Braai & social strategies** that fit your target weight (${userProfile.targetWeightKg || 80} kg)
• **Smart South African ingredient combinations** using what's in your fridge
• **Hydration, protein, and snack recommendations**

What's on your mind today?`
    };
  }

  // 2. WATER & HYDRATION
  if (q.includes('water') || q.includes('hydrate') || q.includes('drink') || q.includes('rooibos') || q.includes('tea') || q.includes('coffee')) {
    const targetL = userProfile.dailyWaterTargetLiters || 2.0;
    return {
      text: `**Hydration Strategy for ${userProfile.name}:**

• **Your Target:** At least **${targetL} Litres** daily (~8 glasses).
• **South African Pro-Tip:** Pure herbal **Rooibos tea** (unsweetened or with a drop of lemon) counts 100% towards your daily water goal because it is naturally caffeine-free and rich in antioxidants.
• **Black Coffee / Tea:** Limit to 2–3 cups daily. Drink an extra glass of water with each coffee.
• **Avoid:** Sugary fizzy drinks, fruit juice concentrates, and sweetened flavoured water.

*Tip: Drink 500ml as soon as you wake up to kickstart your metabolism.*`
    };
  }

  // 3. BRAAI & SOCIAL EVENTS
  if (q.includes('braai') || q.includes('shisanyama') || q.includes('barbecue') || q.includes('party') || q.includes('weekend')) {
    const braaiRecipe = SA_RECIPES.find(r => r.id === 'rec_boerewors_chakalaka_greens');
    return {
      text: `**How to Enjoy a Braai While Hitting Your Goals:**

1. **The Protein (First Priority):**
   • Go for skinless chicken pieces, grilled lean chops, or 100–120g of quality beef boerewors.
2. **The Smart Sides:**
   • Fill half your plate with **green salad**, **grilled gem squash**, braaied mushrooms, or a scoop of **chakalaka**.
3. **The Starch Swap:**
   • Traditional stywe pap or garlic bread is very dense in refined starches. Take **2 tablespoons** if you really want some, or swap for grilled sweetcorn or sautéed morogo.
4. **Drinks:**
   • Stick to water, soda water with lime/lemon, or dry wine / light beer in moderation.`,
      action: braaiRecipe ? { label: 'View Boerewors & Chakalaka Recipe', type: 'view_recipe', payload: braaiRecipe } : undefined
    };
  }

  // 4. BILTONG, DROEWORS & SNACKS
  if (q.includes('biltong') || q.includes('droewors') || q.includes('snack') || q.includes('hunger') || q.includes('hungry')) {
    return {
      text: `**Smart South African Snack Recommendations:**

• **Biltong (Lean Beef or Game):** An outstanding high-protein snack (approx 50g protein per 100g). Stick to **30g–40g** per serving to manage sodium and fat.
• **Boiled Eggs:** 2 large eggs provide 12g of clean protein and keep hunger away for 3+ hours.
• **Raw Almonds or Walnuts:** A small palmful (25g–30g).
• **Cucumber or Bell Pepper Slices:** Enjoy with 1–2 tablespoons of cottage cheese or guacamole.
• **Avoid:** Sweet biscuits, crisps, and sugary rusks during weight loss.`
    };
  }

  // 5. NO CHICKEN / SWAPPING PROTEINS
  if (q.includes("don't have chicken") || q.includes('no chicken') || q.includes('out of chicken') || q.includes('substitute chicken')) {
    const alternative = SA_RECIPES.find(r => r.id === 'rec_beef_mince_cabbage' || r.id === 'rec_grilled_hake_lemon');
    return {
      text: `No chicken? No problem, ${userProfile.name}! 

Here are top equal-protein substitutes available in SA supermarkets:
• **Cape Hake fillets or Snoek:** 38g protein, low calorie, fast 10-minute cook.
• **Lean Beef Mince (extra lean):** 36g protein, pairs great with shredded cabbage.
• **Canned Pilchards or Tuna in Brine:** Rich in Omega-3 and budget-friendly (~R25 a tin).
• **4 Whole Eggs or Egg White Scramble:** Quick 5-minute meal.`,
      action: alternative ? { label: `View ${alternative.title}`, type: 'view_recipe', payload: alternative } : undefined
    };
  }

  // 6. EGGS, CABBAGE & MINCE
  if (q.includes('eggs') && (q.includes('cabbage') || q.includes('mince'))) {
    const recipe = SA_RECIPES.find(r => r.id === 'rec_beef_mince_cabbage');
    return {
      text: `**Savoury Beef & Cabbage Bowl (Fast & High-Protein):**

1. Brown 150g–200g mince in a pan with garlic and onion flakes.
2. Add 2 cups of shredded green cabbage and stir-fry for 5 minutes until tender-crisp.
3. Crack 1–2 eggs directly into the pan or serve sunny-side up on top.

**Total time:** 15 minutes. **Protein:** 44g. **Cost:** Under R40/portion.`,
      action: recipe ? { label: 'Open Mince & Cabbage Recipe', type: 'view_recipe', payload: recipe } : undefined
    };
  }

  // 7. PAP, BREAD, RICE & CARB ALTERNATIVES
  if (q.includes('pap') || q.includes('bread') || q.includes('rice') || q.includes('carb') || q.includes('starch') || q.includes('pasta')) {
    return {
      text: `**Smart Starch Swaps for Sustainable Fat Loss:**

Refined starches like white bread and oversized pap servings cause rapid blood sugar spikes and mid-day energy crashes.

**Top South African Swaps:**
• **Instead of Pap:** Try steamed **Morogo (wild spinach)** or sautéed shredded cabbage with a pinch of nutmeg and garlic.
• **Instead of White Rice:** Use **Cauliflower rice** or finely chopped steamed green beans.
• **Instead of White Bread:** Choose whole-seed rye bread (1 slice) or low-carb seed crackers.
• **Instead of French Fries:** Roast **Gem squash halves** or butternut cubes with olive oil and mixed herbs.`,
    };
  }

  // 8. BUDGET & MAKING MEALS CHEAPER
  if (q.includes('cheap') || q.includes('budget') || q.includes('cost') || q.includes('save money') || q.includes('price') || q.includes('expensive')) {
    return {
      text: `**South African Grocery Budget Optimization:**

Here is how to keep your meals under **R750/week**:
1. **Buy Whole Chickens / Chicken Quarters:** Buying in bulk packs saves up to 40% compared to pre-sliced fillets.
2. **Lean on Tinned Fish & Eggs:** A tin of pilchards in tomato sauce (R22–R28) or eggs gives top-tier protein for a fraction of steak prices.
3. **Seasonal Veg:** Buy whole cabbage, butternut, gem squash, and bulk carrots from Shoprite / Boxer / Checkers.
4. **Prep in Advance:** Cook a batch of spiced mince and roast vegetables on Sunday to prevent expensive mid-week takeaways.`,
      action: { label: 'View Grocery Shopping List', type: 'open_shopping' }
    };
  }

  // 9. WEIGHT LOSS PLATEAU & BELLY FAT
  if (q.includes('plateau') || q.includes('stuck') || q.includes('lose weight') || q.includes('belly fat') || q.includes('weight loss')) {
    return {
      text: `**Breaking a Weight Loss Plateau:**

If the scale hasn't moved for 1–2 weeks:
1. **Check Hidden Liquid Calories:** Ensure no sugar in teas/coffees, fruit juices, or alcohol.
2. **Increase Daily Protein:** Aim for **${userProfile.proteinTargetGrams || 115}g daily** to protect lean muscle and keep metabolic rate high.
3. **Track Cooking Oils:** 1 tablespoon of cooking oil has ~120 kcal. Use an olive oil spray.
4. **Hydration & Sleep:** Drink 2L+ clean water daily and get 7–8 hours of restorative sleep to reduce cortisol levels.`
    };
  }

  // 10. ALCOHOL & BEER
  if (q.includes('alcohol') || q.includes('beer') || q.includes('wine') || q.includes('cider') || q.includes('whisky') || q.includes('gin')) {
    return {
      text: `**Alcohol & Fat Loss Guidelines:**

• **Why Alcohol Pauses Fat Burning:** Your liver prioritizes metabolizing alcohol before burning stored fat.
• **Better Options:** Dry white/red wine, light beer (e.g. Castle Lite, Windhoek Light), or gin/vodka with zero-sugar tonic or soda water.
• **Drinks to Avoid:** Sweet ciders, sugary cocktails, and cream liqueurs.
• **Rule of Thumb:** Limit to 1–2 drinks on social occasions and drink 1 glass of water between drinks.`
    };
  }

  // 11. SWEET CRAVINGS & SUGAR
  if (q.includes('sweet') || q.includes('craving') || q.includes('sugar') || q.includes('chocolate') || q.includes('dessert')) {
    return {
      text: `**Beating Sweet Cravings:**

• **Warm Vanilla Rooibos Tea:** Naturally sweet aroma with zero calories and zero sugar.
• **Dark Chocolate (85%+):** 1–2 small blocks satisfies chocolate cravings with beneficial flavonoids.
• **Greek Yoghurt with Cinnamon:** 2 tablespoons of plain double cream Greek yoghurt with a pinch of cinnamon.
• **Cold Water Check:** Cravings are often mild dehydration in disguise. Drink a large glass of cold water and wait 10 minutes!`
    };
  }

  // 12. FASTING & MEAL TIMING
  if (q.includes('fasting') || q.includes('intermittent') || q.includes('16/8') || q.includes('skip breakfast') || q.includes('eating times')) {
    return {
      text: `**Meal Timing & Fasting for Your Routine:**

Your current plan is configured for **${userProfile.mealsPerDay} meals per day** (${userProfile.preferredEatingTimes?.join(' and ') || '12:00 & 19:00'}).

• **Intermittent Fasting (16:8):** Eating between 12:00 and 20:00 is very effective for weight management because it naturally prevents late-night snacking.
• **During Fasting Window:** You may have clean water, black coffee, and black/herbal Rooibos tea with no sugar or milk.`
    };
  }

  // 13. QUICK 15-20 MIN MEAL
  if (q.includes('quick') || q.includes('20 min') || q.includes('fast') || q.includes('hurry') || q.includes('busy') || q.includes('no time')) {
    const quickRec = SA_RECIPES.find(r => r.id === 'rec_chicken_avo_salad' || r.prepTimeMinutes + r.cookTimeMinutes <= 20);
    return {
      text: `**Super Fast 15-Minute Meal:**

**${quickRec?.title || 'Chicken & Avocado Green Salad'}**
• High protein (${quickRec?.nutrition.proteinG || 42}g)
• Crisp fresh greens, avocado, and quick grilled or leftover chicken strips.
• Zero elaborate prep, ready in under 15 minutes!`,
      action: quickRec ? { label: `Open ${quickRec.title}`, type: 'view_recipe', payload: quickRec } : undefined
    };
  }

  // 14. MEAL PLAN GENERATION
  if (q.includes('meal plan') || q.includes('create plan') || q.includes('generate plan') || q.includes('next week')) {
    return {
      text: `I can generate a customized 7-day South African meal plan tailored to your **${userProfile.mainGoal.replace('_', ' ')}** goal, **${userProfile.mealsPerDay} meals/day**, and **${userProfile.weeklyBudget}** budget.

Would you like me to generate your fresh plan now?`,
      action: { label: 'Generate 7-Day Meal Plan', type: 'create_meal_plan' }
    };
  }

  // 15. FISH & SEAFOOD
  if (q.includes('fish') || q.includes('hake') || q.includes('snoek') || q.includes('tuna') || q.includes('salmon') || q.includes('seafood')) {
    const fishRec = SA_RECIPES.find(r => r.id === 'rec_grilled_hake_lemon');
    return {
      text: `**Cape Fish & Seafood Benefits:**

Cape Hake, Kingklip, Snoek, and Tinned Tuna in brine are among the cleanest proteins available:
• High in bioavailable protein (35g–42g per 200g fillet)
• Low in saturated fat and calories
• Excellent source of iodine, selenium, and Omega-3 fatty acids

Pan-sear or grill with olive oil, garlic, lemon juice, and fresh parsley for a 12-minute dinner.`,
      action: fishRec ? { label: 'View Grilled Hake Recipe', type: 'view_recipe', payload: fishRec } : undefined
    };
  }

  // 16. VEGETARIAN & PLANT-BASED
  if (q.includes('vegetarian') || q.includes('plant') || q.includes('beans') || q.includes('lentils') || q.includes('tofu')) {
    const vegRec = SA_RECIPES.find(r => r.id === 'rec_lentil_durban_curry');
    return {
      text: `**High-Protein Plant-Based Options in SA:**

• **Durban Spiced Lentil & Spinach Curry:** 22g protein, packed with dietary fiber and iron.
• **Eggs & Sautéed Morogo:** Complete amino acid profile with essential micronutrients.
• **Black Beans, Chickpeas & Avocado Bowls:** Filling, affordable, and high in resistant starch.`,
      action: vegRec ? { label: 'View Durban Lentil Curry', type: 'view_recipe', payload: vegRec } : undefined
    };
  }

  // 17. PANTRY / WHAT TO COOK WITH INGREDIENTS
  if (q.includes('pantry') || q.includes('fridge') || q.includes('leftovers') || q.includes('ingredients')) {
    const availablePantry = pantryItems.length > 0 ? pantryItems.join(', ') : 'chicken, mince, eggs, cabbage, spinach';
    return {
      text: `**Cooking with Your Available Ingredients:**

Based on your ingredients (${availablePantry}), you can prepare:
1. **Chicken & Avocado Greens** (if you have chicken & leaves)
2. **Savoury Spiced Beef Mince & Sautéed Cabbage**
3. **Quick 3-Egg Scramble with Herbs & Tomato**

Would you like to open your pantry inventory or view recipes?`,
      action: { label: 'Open My Pantry', type: 'add_pantry' }
    };
  }

  // 18. CONTEXTUAL INTELLIGENT FALLBACK
  const cleanGoal = userProfile.mainGoal.replace('_', ' ');
  return {
    text: `Regarding your question about **"${query}"**:

For your primary goal of **${cleanGoal}** (${userProfile.weightKg} kg → target ${userProfile.targetWeightKg || 80} kg):

1. **Nutritional Focus:** Prioritize a palm-sized lean protein source (chicken, hake, lean mince, eggs) alongside nutrient-dense vegetables (spinach/morogo, cabbage, gem squash).
2. **Portion Control:** Keep refined carbohydrates moderate to maintain stable insulin levels.
3. **Daily Routine:** Stick to your target of **${userProfile.mealsPerDay} meals/day** and drink **${userProfile.dailyWaterTargetLiters || 2.0}L of water** daily.

Would you like me to find a specific recipe, swap an upcoming meal, or adjust your grocery list?`,
    action: { label: 'Browse South African Recipes', type: 'open_shopping' }
  };
}

export async function askNutriCoachAI(
  query: string,
  userProfile: UserProfile,
  currentMealPlan: PlannedMeal[] = [],
  pantryItems: string[] = []
): Promise<{ text: string; imageUrl?: string | null; action?: CoachMessage['suggestedAction']; isLiveAI: boolean }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('nutricoach-chat', {
        body: {
          message: query,
          userProfile: {
            name: userProfile.name,
            goal: userProfile.mainGoal,
            currentWeightKg: userProfile.weightKg,
            targetWeightKg: userProfile.targetWeightKg,
            dietPreference: userProfile.dietaryPreference,
            mealsPerDay: userProfile.mealsPerDay,
            budget: userProfile.weeklyBudget,
            avoidedFoods: userProfile.foodsAvoided,
            allergies: userProfile.allergies,
            pantry: pantryItems,
            plannedMealsToday: currentMealPlan.map(m => m.recipe.title),
          },
        },
      });

      if (!error && data && (data.reply || data.text)) {
        return {
          text: data.reply || data.text,
          imageUrl: data.imageUrl || null,
          action: data.suggestedAction,
          isLiveAI: true,
        };
      }
    } catch (e) {
      console.warn('Supabase edge function invoke notice:', e);
    }
  }

  // Resilient South African deterministic engine fallback
  const fallback = getNutriCoachResponse(query, userProfile, currentMealPlan, pantryItems);
  
  // Match recipe image if available
  let matchedImage: string | null = null;
  const q = query.toLowerCase();
  const matchedRecipe = SA_RECIPES.find(r => q.includes(r.title.toLowerCase()) || r.tags.some(t => q.includes(t.toLowerCase())));
  if (matchedRecipe) {
    matchedImage = matchedRecipe.imageUrl;
  }

  return {
    text: fallback.text,
    imageUrl: matchedImage,
    action: fallback.action,
    isLiveAI: false,
  };
}