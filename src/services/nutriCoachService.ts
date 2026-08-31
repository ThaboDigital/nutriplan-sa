import { UserProfile, Recipe, PlannedMeal } from '../types';
import { SA_RECIPES } from '../data/saFoodDatabase';

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    type: 'swap_meal' | 'view_recipe' | 'add_pantry' | 'open_shopping' | 'create_meal_plan' | 'suggest_recipe';
    payload?: any;
  };
}

export function getNutriCoachResponse(
  query: string,
  userProfile: UserProfile,
  currentMealPlan: PlannedMeal[],
  pantryItems: string[] = []
): { text: string; action?: CoachMessage['suggestedAction'] } {
  const q = query.toLowerCase();

  // 1. "I don't have chicken"
  if (q.includes("don't have chicken") || q.includes('no chicken') || q.includes('out of chicken')) {
    const alternative = SA_RECIPES.find(r => r.id === 'rec_beef_mince_cabbage' || r.id === 'rec_grilled_hake_lemon');
    return {
      text: `No problem, ${userProfile.name}! You can swap chicken with Cape Hake fillets, canned tuna in brine, or lean beef mince. \n\nFor lunch or dinner today, **${alternative?.title}** delivers equivalent clean protein (38g-42g) without relying on chicken.`,
      action: alternative ? { label: `View ${alternative.title}`, type: 'view_recipe', payload: alternative } : undefined
    };
  }

  // 2. "I only have eggs, cabbage and mince"
  if (q.includes('eggs') && (q.includes('cabbage') || q.includes('mince'))) {
    const recipe = SA_RECIPES.find(r => r.id === 'rec_beef_mince_cabbage');
    return {
      text: `That's actually a fantastic high-protein, low-carb trio! Here is how to combine them:\n\n1. **Savoury Beef & Cabbage Stir-fry**: Brown the mince with onion and garlic flakes, then flash-fry the shredded cabbage for 5 minutes.\n2. **Protein Boost**: Crack 1-2 eggs directly into the pan for an egg-fried mince bowl, or boil the eggs on the side.\n\nTotal prep is under 15 minutes and costs under R40 per portion!`,
      action: recipe ? { label: 'Open Mince & Cabbage Recipe', type: 'view_recipe', payload: recipe } : undefined
    };
  }

  // 3. "What can I eat at a braai?"
  if (q.includes('braai') || q.includes('shisanyama') || q.includes('barbecue')) {
    return {
      text: `You can definitely enjoy a South African braai while sticking to your goals! Here is the smart NutriPlan strategy:\n\n?? **The Protein**: Enjoy a palm-sized portion of boerewors (approx 120g) or flame-grilled skinless chicken breast / chops.\n?? **The Sides**: Fill half your plate with green salad, grilled gem squash, braaied mushrooms, or a scoop of chakalaka.\n?? **Smart Swap**: Skip the mountain of stywe pap or garlic bread. If you really want pap, take 2 tablespoons (about 1/2 cup) instead of a double scoop, or enjoy grilled sweetcorn instead!`,
      action: { label: 'View Boerewors & Chakalaka Recipe', type: 'view_recipe', payload: SA_RECIPES.find(r => r.id === 'rec_boerewors_chakalaka_greens') }
    };
  }

  // 4. "Can you make tomorrow's meals cheaper?" / "Make it cheaper" / "budget"
  if (q.includes('cheaper') || q.includes('budget') || q.includes('cost') || q.includes('affordable')) {
    return {
      text: `Here are 3 South African budget-friendly swaps that keep protein high while lowering your grocery bill:\n\n1. **Tinned Tuna & Gem Squash** (~R35/portion vs R55 for fresh meat).\n2. **Durban Spiced Lentils & Spinach** (~R28/portion) - rich in fibre and protein.\n3. **Cabbage & Egg Scramble** (~R25/portion) using everyday pantry staples.\n\nSwapping just 2 meals a week saves an estimated R180/month.`,
      action: { label: 'Check Budget Shopping List', type: 'open_shopping' }
    };
  }

  // 5. "I don't want pap this week" / "lower carb"
  if (q.includes('pap') || q.includes('lower carb') || q.includes('low carb') || q.includes('bread') || q.includes('rice')) {
    return {
      text: `Understood! Since your profile is set to **Balanced Lower-Carb**, your current 7-day meal plan has already replaced heavy pap and white rice with:\n\n� **Velvety Cauliflower Mash** (under chicken fillets)\n� **Shredded Sweet Cabbage** (under spiced mince)\n� **Braised Morogo (Spinach)** with garlic\n� **Steamed Butternut Cubes**\n\nThis keeps your insulin steady, avoids energy crashes, and supports your 82kg target weight!`,
    };
  }

  // 6. "Can I swap beef for fish?"
  if (q.includes('swap beef for fish') || (q.includes('swap') && q.includes('fish'))) {
    const fishRec = SA_RECIPES.find(r => r.id === 'rec_grilled_hake_lemon');
    return {
      text: `Cape Hake or snoek is an outstanding substitute for beef! It reduces saturated fat while delivering 39g of clean protein with anti-inflammatory omega-3 fatty acids.\n\nWould you like to swap your upcoming dinner to **Cape Herb & Lemon Grilled Hake**? Your shopping list will automatically update.`,
      action: fishRec ? { label: 'Swap to Grilled Hake', type: 'swap_meal', payload: fishRec } : undefined
    };
  }

  // 7. "Quick 20-minute meal"
  if (q.includes('quick') || q.includes('20-minute') || q.includes('fast') || q.includes('busy')) {
    const quickRec = SA_RECIPES.find(r => r.prepTimeMinutes + r.cookTimeMinutes <= 20);
    return {
      text: `For a fast meal when time is tight, try **${quickRec?.title || 'Golden Scrambled Eggs with Avocado'}**.\n\nTotal time: **12-15 minutes**.\nNo extensive chopping needed, high protein (24g-42g), and virtually zero cleanup!`,
      action: quickRec ? { label: `View ${quickRec.title}`, type: 'view_recipe', payload: quickRec } : undefined
    };
  }

  // 8. "Use what I have"
  if (q.includes('what i have') || q.includes('pantry') || q.includes('fridge') || q.includes('leftovers')) {
    return {
      text: `Based on your pantry items (${pantryItems.slice(0, 4).join(', ') || 'chicken, eggs, cabbage, mince'}), you can make:\n\n� **Chicken & Avocado Salad**\n� **Savoury Beef Mince & Saut�ed Cabbage**\n� **Quick Scrambled Eggs & Blistered Tomatoes**\n\nCooking with what you have saves you an estimated R120 on your next grocery run!`,
      action: { label: 'Manage My Pantry', type: 'add_pantry' }
    };
  }

  // Default intelligent assistant response
  return {
    text: `Great question, ${userProfile.name}. For your goal of **${userProfile.mainGoal.replace('_', ' ')}** at **${userProfile.mealsPerDay} meals per day**, the key is prioritizing lean protein (chicken, hake, mince, eggs) paired with local vegetables (spinach, cabbage, gem squash) while controlling portion sizes.\n\nWould you like me to adjust your upcoming meal, find a fast recipe, or suggest a braai-friendly option?`
  };
}
