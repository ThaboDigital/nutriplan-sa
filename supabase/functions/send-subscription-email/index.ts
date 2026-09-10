import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailPayload {
  to: string;
  name?: string;
  tier?: "monthly" | "annual";
  amount?: number;
  type?: "welcome_pro" | "subscription_receipt" | "test";
  customSender?: string;
  resendApiKey?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: EmailPayload = await req.json();
    const toEmail = (body.to || "").trim();
    if (!toEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required 'to' email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userName = (body.name || toEmail.split("@")[0] || "Champion").trim();
    const tier = body.tier || "monthly";
    const amountZar = body.amount ?? (tier === "monthly" ? 49.00 : 399.00);
    const planTitle = tier === "annual" ? "NutriPlan SA Pro (Annual Plan)" : "NutriPlan SA Pro (Monthly Plan)";
    const billingCadence = tier === "annual" ? "R399.00 / year (~R33.25/mo)" : "R49.00 / month";

    const apiKey = Deno.env.get("RESEND_API_KEY") || body.resendApiKey;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY is not configured yet. Please provide your Resend API Key.",
          requiresKey: true
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromAddress = body.customSender || Deno.env.get("RESEND_FROM_EMAIL") || "NutriPlan SA <notifications@thabosystems.co.za>";

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NutriPlan SA Pro</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F6F4; margin: 0; padding: 24px; color: #17211B; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E8EDE9; }
    .header { background: #17211B; padding: 32px 28px; text-align: center; }
    .badge { display: inline-block; background: rgba(63, 174, 104, 0.15); color: #3FAE68; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px; border: 1px solid rgba(63, 174, 104, 0.3); }
    .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .salutation { font-size: 20px; font-weight: 800; color: #17211B; margin-bottom: 12px; }
    .card { background: #F8FBF9; border: 1px solid #EAF7EF; border-radius: 20px; padding: 20px; margin: 24px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #E8EDE9; font-size: 14px; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #6B756C; font-weight: 600; }
    .card-value { color: #17211B; font-weight: 800; }
    .perks-list { margin: 20px 0; padding-left: 0; list-style: none; }
    .perks-list li { padding: 8px 0 8px 28px; position: relative; font-size: 14px; font-weight: 600; color: #2D3A31; }
    .perks-list li:before { content: "✓"; position: absolute; left: 0; color: #3FAE68; font-weight: 900; font-size: 16px; }
    .btn { display: inline-block; background: #3FAE68; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 14px; text-align: center; margin-top: 12px; }
    .footer { background: #F8FBF9; padding: 24px 28px; text-align: center; font-size: 12px; color: #6B756C; border-top: 1px solid #E8EDE9; }
    .footer a { color: #2C854E; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">🇿🇦 South African Nutrition</div>
      <h1>Welcome to NutriPlan Pro!</h1>
    </div>
    <div class="content">
      <div class="salutation">Sawubona, ${userName}! 👋</div>
      <p>Thank you for upgrading to <strong>NutriPlan SA Pro</strong>. Your premium subscription is now active, giving you complete access to our personalized meal generator, smart local grocery budgeting, and AI NutriCoach.</p>
      
      <div class="card">
        <div class="card-row">
          <span class="card-label">Selected Plan:</span>
          <span class="card-value">${planTitle}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Amount:</span>
          <span class="card-value">${billingCadence}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Payment Processor:</span>
          <span class="card-value">PayFast South Africa (Secured)</span>
        </div>
        <div class="card-row">
          <span class="card-label">Status:</span>
          <span class="card-value" style="color: #2C854E;">● Active</span>
        </div>
      </div>

      <h3 style="margin-top: 24px; font-size: 16px; font-weight: 800; color: #17211B;">What's Unlocked in Your Account:</h3>
      <ul class="perks-list">
        <li><strong>Unlimited Meal Swaps:</strong> Instantly tailor any South African meal to match your daily budget and fridge ingredients.</li>
        <li><strong>24/7 AI NutriCoach:</strong> Ask real questions about braai strategies, biltong snacks, and low-carb swaps.</li>
        <li><strong>Smart Grocery Cart:</strong> Real-time price tracking for Pick n Pay, Checkers, and Woolworths.</li>
        <li><strong>Multi-Device Cloud Backup:</strong> Seamless sync between your phone, tablet, and desktop.</li>
      </ul>

      <div style="text-align: center; margin: 28px 0 16px;">
        <a href="https://nutriplan.thabosystems.co.za" class="btn" style="color: #ffffff !important;">Launch NutriPlan SA Pro →</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;">Need help with your plan? Contact us at <a href="mailto:info@thabosystems.co.za">info@thabosystems.co.za</a></p>
      <p style="margin: 0;">NutriPlan SA is a product of <strong>Thabo Systems (Pty) Ltd</strong> • South Africa</p>
    </div>
  </div>
</body>
</html>
`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: `🎉 Welcome to NutriPlan SA Pro, ${userName}!`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      if (resendData?.message?.includes("domain") && fromAddress !== "NutriPlan SA <onboarding@resend.dev>") {
        const retryResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "NutriPlan SA <onboarding@resend.dev>",
            to: [toEmail],
            subject: `🎉 Welcome to NutriPlan SA Pro, ${userName}!`,
            html: emailHtml,
          }),
        });
        const retryData = await retryResponse.json();
        return new Response(
          JSON.stringify({ success: retryResponse.ok, data: retryData, sender: "onboarding@resend.dev" }),
          { status: retryResponse.ok ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: resendData?.message || "Failed to send email via Resend.", details: resendData }),
        { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: resendData, sender: fromAddress }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
