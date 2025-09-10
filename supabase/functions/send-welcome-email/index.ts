import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  resultId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== FUNCTION START ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("OPTIONS request handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body...");
    const { email, resultId }: WelcomeEmailRequest = await req.json();
    console.log("Request data:", { email: email ? "✓" : "✗", resultId: resultId ? "✓" : "✗" });

    if (!email || !resultId) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "email and resultId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check RESEND_API_KEY
    const resendKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY present:", resendKey ? "✓" : "✗");
    
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Initializing Resend...");
    const resend = new Resend(resendKey);

    // Get site origin
    const siteOrigin = req.headers.get("origin") || req.headers.get("Origin") || "https://ec587b2f-b360-447b-afee-f65d37a2365e.sandbox.lovable.dev";
    const resultsUrl = `${siteOrigin}/pdf/preview?resultId=${resultId}`;
    console.log("Results URL:", resultsUrl);

    console.log("Sending simple email (no PDF)...");
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: "Canada Immigration Quiz <onboarding@resend.dev>",
      to: [email],
      subject: "Seus Resultados de Imigração para o Canadá 🍁",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #dc2626;">🍁 Seus Resultados de Imigração para o Canadá</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151;">Olá!</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              Obrigado por usar nosso Quiz de Imigração para o Canadá! Sua análise personalizada 
              dos melhores programas de imigração está pronta.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultsUrl}" 
                 style="background-color: #dc2626; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block;">
                🔗 Ver Meus Resultados Online
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2025 Canada Immigration Quiz - Baseado em dados oficiais do governo canadense</p>
          </div>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend error:", JSON.stringify(resendError, null, 2));
      return new Response(JSON.stringify({ error: resendError.message || "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Email sent successfully:", resendData?.id);
    return new Response(JSON.stringify({ success: true, id: resendData?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Function error:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);