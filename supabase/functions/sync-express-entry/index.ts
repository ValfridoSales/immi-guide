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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log({ event: 'sync_start', timestamp: new Date().toISOString() });

    let insertCount = 0;
    let updateCount = 0;
    let errorCount = 0;

    console.log({ event: 'sync_config', message: 'Processing all available rounds from JSON' });

    // Fetch the JSON data that contains all draws
    console.log({ event: 'fetching_json_data' });
    const jsonUrl = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';
    
    try {
      const jsonResponse = await fetch(jsonUrl);
      if (!jsonResponse.ok) {
        throw new Error(`Failed to fetch JSON: ${jsonResponse.status}`);
      }
      
      const jsonData = await jsonResponse.json();
      const roundKeys = Object.keys(jsonData.rounds || {});
      console.log({ event: 'json_fetched', total_rounds: roundKeys.length });
      
      // Process each draw from the JSON
      for (const roundKey of roundKeys) {
        // Extract ID from key (e.g., "r123" -> 123)
        const id = parseInt(roundKey.substring(1));
        
        if (isNaN(id)) {
          console.log({ event: 'invalid_round_key', roundKey });
          continue;
        }
        
        const roundData = jsonData.rounds[roundKey];
        const url = `https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations.html?q=${id}`;
        
        console.log({ event: 'processing_draw', id, draw_name: roundData.drawName });
        
        const drawData = parseDrawDataFromJSON(id, url, roundData);

        if (drawData) {
          const { error } = await supabase
            .from('express_entry_draws')
            .upsert(drawData, { onConflict: 'id' });

          if (error) {
            console.error({ event: 'upsert_error', id, error: error.message });
            errorCount++;
          } else {
            insertCount++;
            console.log({ 
              event: 'draw_synced', 
              id, 
              type: drawData.type, 
              category: drawData.category,
              invitations: drawData.invitations,
              crs: drawData.crs_min
            });
          }
        } else {
          console.log({ event: 'parse_failed', id });
        }
      }
    } catch (jsonError) {
      console.error({ event: 'json_fetch_error', error: jsonError.message });
      return new Response(
        JSON.stringify({ error: 'Failed to fetch draw data from JSON source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = {
      success: true,
      inserted: insertCount,
      updated: updateCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log({ event: 'sync_complete', ...result });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error({ event: 'sync_error', error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseDrawDataFromJSON(id: number, sourceUrl: string, roundData: any): DrawData | null {
  try {
    console.log({ 
      event: 'parse_json_data', 
      id, 
      draw_name: roundData.drawName,
      draw_size: roundData.drawSize,
      draw_crs: roundData.drawCRS
    });

    // Extract invitations - remove commas from numbers like "4,500"
    const invitations = parseInt(roundData.drawSize?.replace(/,/g, '') || '0');
    
    // Extract CRS score
    const crs_min = parseInt(roundData.drawCRS || '0');
    
    // Parse date - format: "October 06, 2025 at 13:59:15 UTC"
    let date = new Date().toISOString();
    if (roundData.drawDateTime) {
      date = new Date(roundData.drawDateTime).toISOString();
    }

    // Determine type and category based on draw name
    let type: 'general' | 'pnp' | 'cec' | 'category' = 'general';
    let category: string | undefined;

    const drawName = roundData.drawName || '';
    
    if (drawName.includes('Provincial Nominee Program') || drawName.includes('Provincial Nominee')) {
      type = 'pnp';
    } else if (drawName.includes('Canadian Experience Class')) {
      type = 'cec';
    } else if (drawName.includes('General')) {
      type = 'general';
    } else {
      // If it's not PNP, CEC, or explicitly General, it's a category-based draw
      type = 'category';
      category = drawName;
    }

    // Extract tie-break timestamp - format: "June 13, 2025 at 19:07:01 UTC"
    let tiebreak_ts: string | undefined;
    if (roundData.drawCutOff) {
      tiebreak_ts = new Date(roundData.drawCutOff).toISOString();
    }

    // Validate data
    if (!invitations || invitations <= 0 || !crs_min || crs_min <= 0) {
      console.log({ 
        event: 'parse_invalid_data', 
        id, 
        invitations, 
        crs_min,
        reason: 'Invalid invitation count or CRS score'
      });
      return null;
    }

    return {
      id,
      date,
      type,
      category,
      invitations,
      crs_min,
      tiebreak_ts,
      source_url: sourceUrl,
    };
  } catch (error) {
    console.error({ event: 'parse_error', id, error: error.message });
    return null;
  }
}