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

    console.log("Processing email request for:", email, "resultId:", resultId);

    // Check if Resend API key is configured
    const resendKey = Deno.env.get("RESEND_API_KEY");
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

    console.log("Resend API key configured");

    // Get the site origin to create the results link
    const siteOrigin = req.headers.get("origin") || req.headers.get("Origin") || Deno.env.get("PUBLIC_SITE_URL") || "";
    const resultsUrl = `${siteOrigin}/pdf/preview?resultId=${resultId}`;
    
    console.log("Results URL:", resultsUrl);

    // Send email with results link
    const fromEnv = Deno.env.get("MAIL_FROM") || "onboarding@resend.dev";
    const from = fromEnv.includes("<") ? fromEnv : `Canada Immigration Quiz <${fromEnv}>`;
    console.log("Using FROM:", from);

    // Generate PDF attachment
    let pdfAttachment = null;
    try {
      const pdfApiKey = Deno.env.get("PDF_API_KEY");
      if (pdfApiKey) {
        console.log("Generating PDF attachment...");
        
        const pdfResponse = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`api:${pdfApiKey}`)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: resultsUrl,
            format: "A4",
            margin: {
              top: "18mm",
              right: "14mm", 
              bottom: "18mm",
              left: "14mm"
            },
            print_background: true,
            wait_for: "networkidle0"
          }),
        });

        if (pdfResponse.ok) {
          const pdfBuffer = await pdfResponse.arrayBuffer();
          const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
          const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
          
          pdfAttachment = {
            filename: `resultado-imigracao-canada-${resultId}-${currentDate}.pdf`,
            content: pdfBase64,
            type: "application/pdf",
            disposition: "attachment"
          };
          
          console.log("PDF attachment generated successfully");
        } else {
          console.warn("PDF generation failed, sending email without attachment");
        }
      }
    } catch (pdfError) {
      console.warn("PDF generation error, sending email without attachment:", pdfError);
    }

    const { data: resendData, error: resendError } = await resend.emails.send({
      from,
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
            
            ${pdfAttachment ? `
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-weight: bold;">
                📎 PDF Anexado
              </p>
              <p style="margin: 8px 0 0; color: #1e40af; font-size: 14px;">
                Sua análise completa está anexada neste email em formato PDF para fácil download e compartilhamento.
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultsUrl}" 
                 style="background-color: #dc2626; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block;">
                🔗 Ver Meus Resultados Online
              </a>
            </div>
            
            <h3 style="color: #374151;">O que você encontrará na sua análise:</h3>
            <ul style="color: #6b7280; line-height: 1.6;">
              <li>Análise de compatibilidade com diferentes programas</li>
              <li>Estimativas de tempo e investimento</li>
              <li>Seus pontos fortes e áreas para melhoria</li>
              <li>Próximos passos recomendados</li>
            </ul>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              💡 <strong>Dica:</strong> Você pode salvar a página online nos favoritos ou compartilhar 
              o link para acessar seus resultados a qualquer momento.
            </p>
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
      ...(pdfAttachment && { attachments: [pdfAttachment] })
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return new Response(JSON.stringify({ error: resendError.message || "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Email queued:", resendData);

    return new Response(JSON.stringify({ success: true, id: resendData?.id }), {
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