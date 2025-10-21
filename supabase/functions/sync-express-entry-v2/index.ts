import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DrawData {
  id: number;
  date: string;
  type: 'general' | 'pnp' | 'cec' | 'category';
  category?: string;
  invitations: number;
  crs_min: number;
  tiebreak_ts?: string;
  source_url: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log({ event: 'sync_started', timestamp: new Date().toISOString() });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // The IRCC page loads data from a JSON file via JavaScript
    // We need to fetch this JSON directly instead of scraping HTML
    const jsonUrl = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';
    console.log({ event: 'fetching_json', url: jsonUrl });

    const jsonResponse = await fetch(jsonUrl);
    if (!jsonResponse.ok) {
      throw new Error(`Failed to fetch JSON: ${jsonResponse.status}`);
    }

    const jsonData = await jsonResponse.json();
    console.log({ event: 'json_fetched', rounds_count: jsonData?.rounds?.length || 0 });

    if (!jsonData.rounds || !Array.isArray(jsonData.rounds)) {
      throw new Error('Invalid JSON structure: missing rounds array');
    }

    let drawsData: DrawData[] = [];
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    let newDraws: any[] = [];

    // Process each round from the JSON
    for (const round of jsonData.rounds) {
      try {
        // Extract draw number from drawNumber field (format: "371")
        const drawId = parseInt(round.drawNumber);
        if (isNaN(drawId) || drawId < 1) {
          console.log({ event: 'skip_round', reason: 'invalid_id', data: round.drawNumber });
          continue;
        }

        // Parse date from drawDate field (format: "2025-10-06")
        const drawDate = new Date(round.drawDate);
        if (isNaN(drawDate.getTime())) {
          console.log({ event: 'skip_round', reason: 'invalid_date', data: round.drawDate });
          continue;
        }

        // Get invitations (remove commas: "4,500" -> 4500)
        const invitations = parseInt(String(round.drawSize).replace(/,/g, ''));
        if (isNaN(invitations)) {
          console.log({ event: 'skip_round', reason: 'invalid_invitations', data: round.drawSize });
          continue;
        }

        // Get CRS score
        const crsMin = parseInt(String(round.drawCRS).replace(/,/g, ''));
        if (isNaN(crsMin)) {
          console.log({ event: 'skip_round', reason: 'invalid_crs', data: round.drawCRS });
          continue;
        }

        // Get program name
        const programText = round.drawName || '';

        // Parse tiebreak timestamp if available
        let tiebreakTs: string | undefined;
        if (round.drawCutOff) {
          try {
            const cutoffDate = new Date(round.drawCutOff);
            if (!isNaN(cutoffDate.getTime())) {
              tiebreakTs = cutoffDate.toISOString();
            }
          } catch {
            // Ignore invalid tiebreak dates
          }
        }

        // Classify draw type and category
        const { type, category } = classifyDraw(programText);

        const drawData: DrawData = {
          id: drawId,
          date: drawDate.toISOString(),
          type,
          category,
          invitations,
          crs_min: crsMin,
          tiebreak_ts: tiebreakTs,
          source_url: `https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations.html?q=${drawId}`,
        };

        drawsData.push(drawData);

        // Log every 50th draw to avoid too many logs
        if (drawId % 50 === 0) {
          console.log({
            event: 'draw_parsed',
            id: drawId,
            date: drawDate.toISOString().split('T')[0],
            type,
            category,
            invitations,
            crs: crsMin,
          });
        }

      } catch (error) {
        console.error({ event: 'round_parse_error', error: error.message });
        errors++;
      }
    }

    console.log({ event: 'parsing_complete', total_draws: drawsData.length });

    // Insert/update draws in database
    for (const drawData of drawsData) {
      try {
        const { data, error } = await supabase
          .from('express_entry_draws')
          .upsert(drawData, { onConflict: 'id' })
          .select();

        if (error) {
          console.error({ event: 'upsert_error', id: drawData.id, error: error.message });
          errors++;
        } else {
          if (data && data.length > 0) {
            // Check if it was an insert or update based on created_at vs updated_at
            const record = data[0];
            if (record.created_at === record.updated_at) {
              inserted++;
              newDraws.push(record);
            } else {
              updated++;
            }
          }
        }
      } catch (error) {
        console.error({ event: 'database_error', id: drawData.id, error: error.message });
        errors++;
      }
    }

    const result = {
      success: true,
      total_draws: drawsData.length,
      inserted,
      updated,
      errors,
      message: `Sincronização concluída: ${drawsData.length} draws processados (${inserted} novos, ${updated} atualizados, ${errors} erros)`,
    };

    console.log({ event: 'sync_complete', ...result });

    // Send alerts for new draws to Pro users
    if (newDraws.length > 0) {
      console.log({ event: 'sending_alerts', new_draws: newDraws.length });
      
      // Send alert for the most recent draw only (to avoid spam)
      const mostRecentDraw = newDraws.reduce((latest, draw) => 
        new Date(draw.draw_date) > new Date(latest.draw_date) ? draw : latest
      );

      try {
        const alertResponse = await fetch(`${supabaseUrl}/functions/v1/send-draw-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ drawData: mostRecentDraw }),
        });

        if (alertResponse.ok) {
          const alertResult = await alertResponse.json();
          console.log({ event: 'alerts_sent', ...alertResult });
        } else {
          console.error({ event: 'alert_error', status: alertResponse.status });
        }
      } catch (error) {
        console.error({ event: 'alert_send_failed', error: error.message });
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error({ event: 'sync_failed', error: error.message, stack: error.stack });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function classifyDraw(programText: string): { type: 'general' | 'pnp' | 'cec' | 'category'; category?: string } {
  const text = programText.toLowerCase();

  if (text.includes('provincial nominee') || text.includes('pnp')) {
    return { type: 'pnp' };
  }

  if (text.includes('canadian experience class') || text.includes('cec')) {
    return { type: 'cec' };
  }

  if (text.includes('no program specified') || text === 'general') {
    return { type: 'general' };
  }

  // Category-based draws
  if (
    text.includes('healthcare') ||
    text.includes('stem') ||
    text.includes('trade') ||
    text.includes('transport') ||
    text.includes('agriculture') ||
    text.includes('french') ||
    text.includes('language')
  ) {
    return { type: 'category', category: programText };
  }

  // Default to category with the program name
  return { type: 'category', category: programText };
}
