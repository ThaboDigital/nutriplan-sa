import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
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

const SYSTEM_PROMPT = `You are NutriCoach, an expert, encouraging, and culturally attuned South African nutrition advisor for NutriPlan SA.

CRITICAL INSTRUCTIONS:
1. Provide a direct, high-value answer immediately without conversational filler (Never say "Regarding your question...", "As an AI...", "Certainly!").
2. Deep South African Context: Actively incorporate local staples:
   - Morogo (wild spinach), shredded braised cabbage, Mala Mogodu (beef tripe), Maotwana (chicken feet), Malana (chicken giblets/livers), canned pilchards (Lucky Star in tomato), amasi (sour milk), eggs, lean beef mince, avocado, snoek, and Cape hake.
   - Starch Swaps: Smartly recommend replacing heavy stiff pap or white bread with braised cabbage, steamed morogo, or cauliflower mash for sustainable weight loss.
3. User Awareness: Always reference the user's personal targets (e.g. current weight to target weight, daily water target) when advising.
4. Keep advice under 150-200 words, practical, and formatted in clean Markdown with bold bullet points.
5. If recommending a specific meal swap, you may end with an action JSON block:
\`\`\`action
{ "type": "view_recipe", "label": "View Recipe Details" }
\`\`\``;

// Helper to generate food image via Imagen 3 or Gemini Vision
async function generateFoodImage(dishName: string, apiKey: string): Promise<string | null> {
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
    console.warn("Imagen generation notice:", err);
  }

  // Curated high-res South African food imagery fallback
  const d = dishName.toLowerCase();
  if (d.includes("mogodu") || d.includes("tripe")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("chicken") || d.includes("maotwana") || d.includes("feet")) {
    return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("fish") || d.includes("pilchards") || d.includes("hake")) {
    return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("braai") || d.includes("boerewors") || d.includes("chakalaka")) {
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80";
  }
  if (d.includes("salad") || d.includes("greens") || d.includes("morogo") || d.includes("cabbage")) {
    return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestPayload = await req.json();
    const query = body.message || body.query || "";
    const ctx = body.userProfile || body.context || {};

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing required 'message' or 'query' field." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    // If Gemini Key is present, generate response via Gemini 2.5 Flash
    let replyText = "";
    let generatedImageUrl: string | null = null;

    if (geminiApiKey) {
      const userPrompt = `USER CONTEXT:
Name: ${ctx.userName || ctx.name || "User"}
Current Weight: ${ctx.currentWeightKg || ctx.weightKg || 78}kg | Target Weight: ${ctx.targetWeightKg || 70}kg
Dietary Style: ${ctx.dietPreference || ctx.dietaryPreference || "Mzansi Budget Banting / Lower-Carb"}
Budget: ${ctx.budget || ctx.weeklyBudget || "R750/week"}
Meals Per Day: ${ctx.mealsPerDay || 3}
Avoided: ${(ctx.avoidedFoods || ctx.foodsAvoided || []).join(", ") || "None"}
Allergies: ${(ctx.allergies || []).join(", ") || "None"}

USER QUESTION:
"${query}"`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${geminiApiKey}`;

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 600,
          },
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    }

    // Fallback if API key missing or call failed
    if (!replyText) {
      replyText = `**South African Nutrition Guidance for ${ctx.userName || ctx.name || "you"}:**

• **Protein Priority:** Pair affordable staples like **Mala Mogodu**, **Maotwana (chicken feet)**, or **tinned pilchards** with braised cabbage or morogo.
• **Smart Starch Swap:** Swap stiff white pap or white bread for sautéed cabbage or cauliflower mash to manage insulin and stay on track toward ${ctx.targetWeightKg || 70}kg.
• **Hydration:** Ensure at least 2.0L daily with unsweetened pure Rooibos tea counting 100%.`;
    }

    // Check if query is recipe or food-related to generate dynamic 16:9 food preview
    const isFoodRelated = /recipe|cook|food|eat|dinner|lunch|breakfast|meal|chicken|mogodu|pilchard|braai|cabbage|morogo|stew|egg/i.test(query);
    if (isFoodRelated && geminiApiKey) {
      generatedImageUrl = await generateFoodImage(query, geminiApiKey);
    } else if (isFoodRelated) {
      generatedImageUrl = await generateFoodImage(query, "");
    }

    return new Response(
      JSON.stringify({
        reply: replyText,
        text: replyText,
        imageUrl: generatedImageUrl,
        isLiveAI: Boolean(geminiApiKey),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});