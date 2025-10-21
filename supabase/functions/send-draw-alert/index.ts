import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-DRAW-ALERT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { drawData } = await req.json();
    logStep("Received draw data", { drawId: drawData?.id });

    if (!drawData) {
      throw new Error("No draw data provided");
    }

    // Get all Pro users with alerts enabled
    const { data: proUsers, error: usersError } = await supabaseClient
      .from('subscriptions')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('status', 'active')
      .eq('plan_type', 'pro');

    if (usersError) throw usersError;
    logStep("Found Pro users", { count: proUsers?.length || 0 });

    if (!proUsers || proUsers.length === 0) {
      logStep("No Pro users to notify");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No Pro users to notify" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Send email to each Pro user
    let emailsSent = 0;
    for (const user of proUsers) {
      try {
        const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;
        
        if (!profile?.email) continue;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); 
                        color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .draw-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; 
                          border-left: 4px solid #DC2626; }
              .draw-info h3 { margin-top: 0; color: #DC2626; }
              .stat { display: inline-block; margin: 10px 20px 10px 0; }
              .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
              .stat-value { font-size: 24px; font-weight: bold; color: #DC2626; }
              .button { display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
                       color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; 
                       margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🇨🇦 Novo Express Entry Draw!</h1>
                <p>Um novo round de convites foi anunciado</p>
              </div>
              <div class="content">
                <p>Olá ${profile.full_name || 'Usuário'},</p>
                <p>Um novo Express Entry draw acaba de ser publicado pelo IRCC. Confira os detalhes:</p>
                
                <div class="draw-info">
                  <h3>Informações do Draw</h3>
                  <div class="stat">
                    <div class="stat-label">Data do Draw</div>
                    <div class="stat-value">${new Date(drawData.draw_date).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-label">CRS Mínimo</div>
                    <div class="stat-value">${drawData.crs_score}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-label">ITAs Emitidos</div>
                    <div class="stat-value">${drawData.invitations_issued?.toLocaleString('pt-BR') || 'N/A'}</div>
                  </div>
                  ${drawData.draw_type ? `
                  <div class="stat">
                    <div class="stat-label">Tipo</div>
                    <div class="stat-value" style="font-size: 16px;">${drawData.draw_type}</div>
                  </div>
                  ` : ''}
                </div>

                <p>Acesse sua conta para ver análises detalhadas e comparar com sua pontuação:</p>
                
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('https://', 'https://app.')}/express-entry/draws" class="button">
                  Ver Detalhes Completos
                </a>

                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  💡 <strong>Dica:</strong> Acesse seu dashboard para ver como este draw se compara com sua pontuação atual.
                </p>
              </div>
              <div class="footer">
                <p>Guia Canadá - Seu companheiro na jornada para o Canadá</p>
                <p>Você está recebendo este email porque é assinante Pro com alertas ativados.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const { error: emailError } = await supabaseClient.functions.invoke('send-welcome-email', {
          body: {
            email: profile.email,
            subject: `🇨🇦 Novo Express Entry Draw - CRS ${drawData.crs_score}`,
            html: emailHtml,
          },
        });

        if (emailError) {
          logStep("Error sending email", { email: profile.email, error: emailError.message });
        } else {
          emailsSent++;
          logStep("Email sent successfully", { email: profile.email });
        }
      } catch (error: any) {
        logStep("Error processing user", { userId: user.user_id, error: error.message });
      }
    }

    logStep("Alerts sent", { total: proUsers.length, successful: emailsSent });

    return new Response(JSON.stringify({ 
      success: true,
      emailsSent,
      totalUsers: proUsers.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
