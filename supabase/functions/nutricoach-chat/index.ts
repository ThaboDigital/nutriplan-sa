import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CANDIDATE_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash"
];
const IMAGEN_MODEL = "imagen-3.0-generate-002";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CoachContext {
  userName?: string;
  name?: string;
  goal?: string;
  mainGoal?: string;
  currentWeightKg?: number;
  weightKg?: number;
  targetWeightKg?: number;
  dietPreference?: string;
  dietaryPreference?: string;
  mealsPerDay?: number;
  budget?: string;
  weeklyBudget?: string;
  avoidedFoods?: string[];
  foodsAvoided?: string[];
  allergies?: string[];
  pantry?: string[];
  plannedMealsToday?: string[];
}

interface RequestPayload {
  message?: string;
  query?: string;
  userProfile?: CoachContext;
  context?: CoachContext;
}

const SYSTEM_PROMPT = `You are NutriCoach, the expert personal nutrition coach for NutriPlan SA.

CRITICAL INSTRUCTIONS:
1. ALWAYS answer the user's EXACT question or prompt directly in your first sentence.
2. If the user asks for a recipe, meal idea, or food item, your VERY FIRST words must be the Recipe Name, followed by:
   - **Ingredients:** (South African supermarket items with exact portions)
   - **Method:** (2-4 simple preparation steps)
   - **Estimated Macros:** (~Calories, ~Protein, ~Fat, ~Net Carbs)
3. NEVER output generic boilerplate lists or unrelated greeting summaries unless specifically asked for general advice.
4. Deep South African Context:
   - Understand local ingredients: avocado, morogo/spinach, braised cabbage, Mala Mogodu (beef tripe), Maotwana (chicken feet), Malana (giblets/livers), canned pilchards (Lucky Star), Cape hake, lean mince, amasi, eggs, rooibos tea.
   - For starch swaps, suggest replacing heavy pap/bread with braised cabbage, morogo, or cauli-mash.
5. User Context Awareness:
   - Incorporate the user's target weight and diet style naturally without reciting their whole profile.
6. Keep the response concise, practical, and formatted in clean Markdown.`;

// Call Gemini API with model fallback
async function generateGeminiText(userPrompt: string, apiKey: string): Promise<string> {
  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 800,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        const errText = await res.text();
        console.warn(`Model ${model} returned error status ${res.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`Fetch error for model ${model}:`, err);
    }
  }
  return "";
}

// Generate food image via Imagen 3 or fallback curated image
async function generateFoodImage(dishName: string, apiKey: string): Promise<string | null> {
  if (apiKey) {
    try {
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict?key=${apiKey}`;
      const prompt = `Professional appetizing studio food photography of ${dishName}, South African culinary presentation, warm natural lighting, balanced portion on a ceramic plate, 4k resolution, 16:9 aspect ratio.`;

      const imagenRes = await fetch(imagenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            outputMimeType: "image/jpeg",
          },
        }),
      });

      if (imagenRes.ok) {
        const data = await imagenRes.json();
        if (data?.predictions?.[0]?.bytesBase64Encoded) {
          return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
        }
      }
    } catch (err) {
      console.warn("Imagen generation error:", err);
    }
  }

  // Curated high-res South African food imagery fallbacks
  const d = dishName.toLowerCase();
  if (d.includes("salad") || d.includes("avocado") || d.includes("avo")) {
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("mogodu") || d.includes("tripe")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("feet") || d.includes("maotwana") || d.includes("chicken")) {
    return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("pilchard") || d.includes("fish") || d.includes("hake")) {
    return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("egg") || d.includes("breakfast")) {
    return "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("braai") || d.includes("boerewors") || d.includes("chakalaka")) {
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("greens") || d.includes("morogo") || d.includes("cabbage")) {
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";
}

// Intent-based fallback response engine if offline
function getDirectIntentFallback(query: string, ctx: CoachContext): string {
  const q = query.toLowerCase();
  const name = ctx.userName || ctx.name || "there";
  const targetW = ctx.targetWeightKg || 75;

  if (q.includes("salad") || q.includes("avocado") || q.includes("avo")) {
    return `**Mzansi Fresh Avocado & Greens Salad**

• **Ingredients:**
  - 1 medium ripe South African avocado, sliced
  - 2 cups mixed crisp greens (cos lettuce & baby spinach)
  - 1/2 English cucumber, sliced into thin ribbons
  - 6 cherry tomatoes, halved
  - 1 tbsp extra virgin olive oil + fresh lemon juice
  - Pinch of sea salt, black pepper, and toasted sunflower seeds

• **Method:**
  1. Toss greens, cucumber ribbons, and cherry tomatoes in a salad bowl with olive oil and lemon juice.
  2. Arrange sliced avocado on top.
  3. Season with sea salt, coarse black pepper, and sunflower seeds for crunch.

• **Estimated Macros:**
  ~220 kcal • 3g Protein • 20g Healthy Fats • 4g Net Carbs. Perfect for your ${targetW}kg weight goal!`;
  }

  if (q.includes("mogodu") || q.includes("tripe")) {
    return `**Mala Mogodu (Slow-Stewed Traditional Beef Tripe) with Morogo**

• **Ingredients:**
  - 200g cleaned beef tripe & intestines (Mogodu)
  - 1 diced brown onion & 2 crushed garlic cloves
  - 100g steamed morogo / wild spinach
  - 1 tsp mild curry powder, bay leaf, salt & pepper

• **Method:**
  1. Simmer cleaned mogodu in seasoned water with bay leaf for 40 minutes until tender.
  2. Sauté onion and curry powder in a pan; stir into the broth.
  3. Fold in fresh morogo in the final 5 minutes.

• **Estimated Macros:**
  ~310 kcal • 36g Protein • 18g Fat • 2g Net Carbs. High collagen, zero sugar!`;
  }

  if (q.includes("feet") || q.includes("maotwana")) {
    return `**Maotwana (Spiced Simmered Chicken Feet) over Braised Cabbage**

• **Ingredients:**
  - 200g cleaned chicken feet
  - 1/2 tin chopped tomatoes & onions
  - 150g shredded green cabbage
  - 1 tsp paprika, cayenne pepper & salt

• **Method:**
  1. Boil chicken feet in water with salt for 20 minutes until tender.
  2. Add tomato, onion, and spices; simmer until sauce thickens.
  3. Serve hot over steamed shredded cabbage instead of pap.

• **Estimated Macros:**
  ~280 kcal • 28g Protein • 18g Fat • 3g Net Carbs. Ultra-budget friendly!`;
  }

  if (q.includes("pilchard") || q.includes("fish") || q.includes("lucky star")) {
    return `**Spiced Pilchards in Tomato Chilli Sauce with Shredded Cabbage**

• **Ingredients:**
  - 1 tin (200g) Lucky Star pilchards in tomato/chilli sauce
  - 180g finely shredded cabbage
  - 1 small onion & 1 clove garlic, chopped
  - 1 tsp oil & black pepper

• **Method:**
  1. Sauté onion and garlic in 1 tsp oil until soft.
  2. Add shredded cabbage with 2 tbsp water; steam covered for 5 minutes.
  3. Pour in pilchards with sauce; simmer gently for 4 minutes.

• **Estimated Macros:**
  ~350 kcal • 34g Protein • 16g Fat • 7g Net Carbs. Packed with Omega-3s!`;
  }

  if (q.includes("pap") || q.includes("starch") || q.includes("swap")) {
    return `**Best South African Starch Swaps for Weight Loss:**

• **Swap Stiff White Pap for:** Braised cabbage with onions (~4g carbs vs 55g carbs in pap).
• **Swap White Bread for:** Lettuce wraps or 2 boiled eggs + half sliced avocado.
• **Swap White Rice for:** Cauliflower mash or sautéed morogo/spinach.
• **Why it works:** Keeps insulin low and accelerates fat burning toward your target weight (${targetW}kg).`;
  }

  return `**Direct Nutrition Advice for ${name}:**

To answer your question regarding **"${query}"**:
• **Meal Strategy:** Prioritize a high-protein base (chicken, beef tripe, pilchards, eggs) paired with fibrous green vegetables (morogo, cabbage).
• **Portions:** Keep starches minimal to maintain steady energy and burn fat toward your ${targetW}kg target.
• **Hydration:** Pair your meals with pure water or unsweetened Rooibos tea (2.0L+ daily).`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestPayload = await req.json();
    const query = (body.message || body.query || "").trim();
    const ctx = body.userProfile || body.context || {};

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing required 'message' in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
    let replyText = "";
    let isLiveAI = false;

    if (geminiApiKey) {
      const userPrompt = `USER CONTEXT:
Name: ${ctx.userName || ctx.name || "User"}
Current Weight: ${ctx.currentWeightKg || ctx.weightKg || 80}kg | Target: ${ctx.targetWeightKg || 72}kg
Dietary Style: ${ctx.dietPreference || ctx.dietaryPreference || "Mzansi Budget Banting / Lower-Carb"}
Budget: ${ctx.budget || ctx.weeklyBudget || "R750/week"}

USER'S EXACT QUESTION:
"${query}"`;

      replyText = await generateGeminiText(userPrompt, geminiApiKey);
      if (replyText) {
        isLiveAI = true;
      }
    }

    // Direct Intent Fallback if Gemini is unreachable
    if (!replyText) {
      replyText = getDirectIntentFallback(query, ctx);
    }

    // Generate or match 16:9 food preview image
    const isFoodRelated = /recipe|cook|food|eat|dinner|lunch|breakfast|meal|chicken|mogodu|pilchard|braai|cabbage|morogo|stew|egg|salad|avocado|avo/i.test(query);
    let generatedImageUrl: string | null = null;
    if (isFoodRelated) {
      generatedImageUrl = await generateFoodImage(query, geminiApiKey);
    }

    return new Response(
      JSON.stringify({
        reply: replyText,
        text: replyText,
        imageUrl: generatedImageUrl,
        isLiveAI,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});