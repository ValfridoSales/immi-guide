import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  resultId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resultId }: WelcomeEmailRequest = await req.json();

    if (!email || !resultId) {
      return new Response(
        JSON.stringify({ error: "email and resultId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate PDF by calling the generate-pdf function
    const baseUrl = Deno.env.get("SUPABASE_URL");
    const siteOrigin = req.headers.get("origin") || req.headers.get("Origin") || Deno.env.get("PUBLIC_SITE_URL") || "";
    const pdfResponse = await fetch(`${baseUrl}/functions/v1/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization") || "",
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
      },
      body: JSON.stringify({ resultId, siteOrigin }),
    });

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text().catch(() => "");
      throw new Error(`Failed to generate PDF (${pdfResponse.status}): ${errText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `resultado-${resultId}-${currentDate}.pdf`;

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: Deno.env.get("MAIL_FROM") || "Canada Immigration Quiz <noreply@lovable.app>",
      to: [email],
      subject: "Seu PDF de Resultados — Imigração Canadá",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #dc2626;">🍁 Seus Resultados de Imigração para o Canadá</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151;">Olá!</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              Obrigado por usar nosso Quiz de Imigração para o Canadá! Em anexo, você encontrará 
              uma análise personalizada dos melhores programas de imigração para o seu perfil.
            </p>
            
            <h3 style="color: #374151;">O que você vai encontrar no PDF:</h3>
            <ul style="color: #6b7280; line-height: 1.6;">
              <li>Análise de compatibilidade com diferentes programas</li>
              <li>Estimativas de tempo e investimento</li>
              <li>Seus pontos fortes e áreas para melhoria</li>
              <li>Próximos passos recomendados</li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">
              ⚠️ IMPORTANTE: Esta análise é informativa
            </p>
            <p style="margin: 8px 0 0; color: #92400e; font-size: 14px;">
              Regras, valores e prazos mudam com frequência. Sempre confira no site oficial do IRCC 
              (canada.ca) ou consulte um profissional de imigração licenciado (RCIC) para decisões oficiais.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2025 Canada Immigration Quiz - Baseado em dados oficiais do governo canadense</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename,
          content: Array.from(new Uint8Array(pdfBuffer)),
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);