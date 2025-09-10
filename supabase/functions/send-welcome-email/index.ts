import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  resultId: string;
}

interface QuizResult {
  programId: string;
  programName: string;
  compatibility: number;
  estimatedTime: string;
  investment: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  description: string;
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

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Database service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Fetching quiz results...");
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (quizError) {
      console.error("Error fetching quiz results:", quizError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch quiz results" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const results = quizData?.results as QuizResult[] || [];
    const userName = quizData?.user_name || "Olá";
    
    // Get top 3 results
    const topResults = results.slice(0, 3);

    console.log("Sending email with embedded results...");
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: "Canada Immigration Quiz <onboarding@resend.dev>",
      to: [email],
      subject: "Seus Resultados de Imigração para o Canadá 🍁",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🍁 Seus Resultados de Imigração para o Canadá</h1>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #374151; margin-top: 0;">Olá ${userName}!</h2>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              Obrigado por usar nosso Quiz de Imigração para o Canadá! Aqui estão os <strong>top 3 programas</strong> 
              mais compatíveis com seu perfil:
            </p>
            
            ${topResults.map((result, index) => `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="background-color: #dc2626; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 14px;">${index + 1}</span>
                  <h3 style="margin: 0; color: #1f2937; font-size: 18px;">${result.programName}</h3>
                </div>
                
                <div style="margin-bottom: 15px;">
                  <div style="background-color: #e5f3ff; border-radius: 4px; padding: 8px 12px; display: inline-block; margin-right: 10px;">
                    <span style="color: #1d4ed8; font-weight: bold;">Compatibilidade: ${result.compatibility}%</span>
                  </div>
                  <div style="background-color: #f0fdf4; border-radius: 4px; padding: 8px 12px; display: inline-block; margin-right: 10px;">
                    <span style="color: #166534; font-weight: bold;">Tempo: ${result.estimatedTime}</span>
                  </div>
                  <div style="background-color: #fef3c7; border-radius: 4px; padding: 8px 12px; display: inline-block;">
                    <span style="color: #92400e; font-weight: bold;">Investimento: ${result.investment}</span>
                  </div>
                </div>
                
                <p style="color: #4b5563; line-height: 1.5; margin-bottom: 15px; font-size: 14px;">
                  ${result.description}
                </p>
                
                <div style="margin-bottom: 15px;">
                  <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 14px;">✅ Suas Forças:</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
                    ${result.strengths.map(strength => `<li style="margin-bottom: 4px;">${strength}</li>`).join('')}
                  </ul>
                </div>
                
                <div>
                  <h4 style="color: #d97706; margin: 0 0 8px 0; font-size: 14px;">🔄 Oportunidades de Melhoria:</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
                    ${result.improvements.map(improvement => `<li style="margin-bottom: 4px;">${improvement}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-top: 30px;">
              <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">⚖️ Aviso Legal Importante</h3>
              <p style="color: #7f1d1d; font-size: 12px; line-height: 1.4; margin: 0;">
                Esta análise é baseada nas informações fornecidas e serve apenas como orientação inicial. 
                Os requisitos de imigração podem mudar e cada caso é único. Recomendamos consultar um 
                consultor de imigração licenciado para uma avaliação completa e atualizada.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background-color: #f8fafc; color: #9ca3af; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0;">© 2025 Canada Immigration Quiz - Baseado em dados oficiais do governo canadense</p>
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