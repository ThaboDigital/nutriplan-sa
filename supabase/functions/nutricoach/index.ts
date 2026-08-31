import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Central Model Configuration Constant
const GEMINI_MODEL = "gemini-2.5-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CoachContext {
  userName?: string;
  goal?: string;
  currentWeightKg?: number;
  targetWeightKg?: number;
  dietPreference?: string;
  mealsPerDay?: number;
  budget?: string;
  avoidedFoods?: string[];
  allergies?: string[];
  pantry?: string[];
  plannedMealsToday?: string[];
}

interface RequestPayload {
  query: string;
  context?: CoachContext;
  mode?: "chat" | "meal_plan" | "weekly_review";
}

const SYSTEM_PROMPT = `You are NutriCoach, an expert, friendly, and practical South African nutrition assistant within the NutriPlan SA application.
Your goal is to guide users to eat healthier, hit their protein and hydration targets, lose excess weight sustainably, and plan affordable meals without complicated or miserable diets.

KEY PRINCIPLES:
1. South African Relevance: You understand local foods, ingredients, and lifestyle (braais, biltong, morogo/spinach, gem squash, chakalaka, tinned fish, lean beef mince, Cape hake, rooibos). Use ZAR (Rands) for budget references.
2. Cultural Sensitivity: Never demonize traditional South African foods like pap, stew, or potjiekos. Always suggest sensible portion control, higher protein combinations, or nutrient-dense vegetable swaps (e.g. cauliflower mash, sautéed morogo/cabbage).
3. Practical & Affordable: Suggest supermarket-accessible ingredients from Shoprite, Checkers, Pick n Pay, Woolworths, or Boxer. Keep recipes under 30 minutes where possible.
4. Health & Safety: You provide general wellness and nutritional coaching only. DO NOT diagnose medical conditions, prescribe medication, recommend extreme starvation (< 1200 kcal), or encourage disordered eating. For medical or pregnancy conditions, advise consulting a healthcare professional.
5. Structured Actions: When recommending specific actions, you may optionally return a structured action JSON block if helpful:
   - view_recipe: { "type": "view_recipe", "payload": { "id": "rec_chicken_avo_salad", "title": "Chicken & Avocado Green Salad" }, "label": "View Recipe" }
   - swap_meal: { "type": "swap_meal", "payload": { "id": "rec_beef_mince_cabbage", "title": "Savoury Beef Mince & Sautéed Cabbage Bowl" }, "label": "Swap Tonight's Meal" }
   - add_pantry: { "type": "add_pantry", "label": "Add to My Pantry" }
   - open_shopping: { "type": "open_shopping", "label": "Open Shopping List" }

FORMAT:
Provide a concise, direct, supportive response in conversational Markdown. Avoid lengthy disclaimers in every reply.
If returning a structured action, include it at the end enclosed in a JSON block like:
\`\`\`action
{ "type": "swap_meal", "label": "Swap to Savoury Beef Mince & Cabbage" }
\`\`\``;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: RequestPayload = await req.json();
    const { query, context = {}, mode = "chat" } = payload;

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing required 'query' in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY not configured on server.",
          fallbackRequired: true
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Context Construction
    const contextPrompt = `
USER PROFILE & CURRENT CONTEXT:
- Name: ${context.userName || "User"}
- Goal: ${context.goal || "Lose excess weight & eat healthier"}
- Dietary Style: ${context.dietPreference || "Balanced Lower-Carb"}
- Meals Per Day: ${context.mealsPerDay || 2}
- Weekly Budget: ${context.budget || "R750"}
- Foods Avoided: ${(context.avoidedFoods || []).join(", ") || "None"}
- Allergies: ${(context.allergies || []).join(", ") || "None"}
- Today's Planned Meals: ${(context.plannedMealsToday || []).join(" | ") || "None set yet"}
- Available in Pantry: ${(context.pantry || []).join(", ") || "Standard South African pantry"}

USER QUERY:
"${query}"
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT + "\n\n" + contextPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({
          error: "Gemini generation failed",
          details: errText,
          fallbackRequired: true
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response right now.";

    // Parse structured action if present
    let action = null;
    let cleanReply = rawText;
    const actionMatch = rawText.match(/```action\s*([\s\S]*?)```/);
    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1].trim());
        cleanReply = rawText.replace(/```action\s*[\s\S]*?```/, "").trim();
      } catch (e) {
        console.warn("Failed to parse action JSON from Gemini output:", e);
      }
    }

    return new Response(
      JSON.stringify({
        reply: cleanReply,
        suggestedAction: action,
        isLiveAI: true,
        model: GEMINI_MODEL
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Edge function unhandled error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error", fallbackRequired: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});