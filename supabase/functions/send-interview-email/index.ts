import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, studentName, interviewType, date, timeSlot } = await req.json();

    if (!email || !interviewType || !date || !timeSlot) {
      return new Response(
        JSON.stringify({ error: "Missing required fields for email delivery." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY secret not found in environment.");
      return new Response(
        JSON.stringify({ error: "Resend API key secret is not configured in Supabase." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nameToUse = studentName || email.split("@")[0];

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "InternIQ <onboarding@resend.dev>",
        to: [email],
        subject: `Mock Interview Confirmed: ${interviewType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #0d9488, #059669); padding: 20px; border-radius: 12px; color: #ffffff; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">InternIQ</h1>
              <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">1-on-1 Mock Interview Confirmation</p>
            </div>

            <div style="padding: 24px 0; color: #1e293b;">
              <p style="font-size: 16px;">Hi <strong>${nameToUse}</strong>,</p>
              <p>Your 1-on-1 mock interview session has been successfully scheduled! Below are your session details:</p>

              <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 4px 0;"><strong>🎯 Interview Type:</strong> ${interviewType}</p>
                <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${date}</p>
                <p style="margin: 4px 0;"><strong>⏰ Time Slot:</strong> ${timeSlot}</p>
              </div>

              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 8px; color: #166534; font-size: 14px;">
                📌 <strong>Meeting Link:</strong> Our team will share the Google Meet invite link shortly before your scheduled time slot.
              </div>

              <p style="margin-top: 24px; font-size: 14px; color: #64748b;">
                Need to reschedule or have questions? Contact us directly via your InternIQ dashboard.
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
              © ${new Date().getFullYear()} InternIQ Advanced Hiring Platform. All rights reserved.
            </div>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      return new Response(
        JSON.stringify({ error: emailData.message || "Failed to send email via Resend API." }),
        { status: emailResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: emailData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
