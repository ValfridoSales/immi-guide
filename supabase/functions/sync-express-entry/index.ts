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

    // Always start from ID 290 to ensure we scan all draws and fix any bad data
    const startId = 290;
    const maxAttempts = 100; // Check up to 100 IDs forward
    let insertCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    console.log({ event: 'sync_config', start_id: startId, max_attempts: maxAttempts });

    // Try fetching draws starting from last known ID
    for (let id = startId; id < startId + maxAttempts; id++) {
      const url = `https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations.html?q=${id}`;
      
      try {
        const response = await fetch(url);
        
        if (response.status === 404) {
          notFoundCount++;
          console.log({ event: 'draw_not_found', id, consecutive_404s: notFoundCount });
          // If we get 5 consecutive 404s, stop searching
          if (notFoundCount >= 5) {
            console.log({ event: 'sync_limit_reached', last_checked_id: id });
            break;
          }
          continue;
        }
        
        // Reset 404 counter on successful fetch
        notFoundCount = 0;

        if (!response.ok) {
          console.log({ event: 'fetch_error', id, status: response.status });
          continue;
        }

        const html = await response.text();
        
        console.log({ event: 'parsing_draw', id, html_length: html.length });
        
        const drawData = parseDrawData(id, url, html);

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

        // Rate limiting - wait 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error({ event: 'processing_error', id, error: error.message });
        errorCount++;
      }
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

function parseDrawData(id: number, sourceUrl: string, html: string): DrawData | null {
  try {
    // Log HTML snippet for debugging
    console.log({ 
      event: 'parse_attempt', 
      id, 
      html_snippet: html.substring(0, 500).replace(/\s+/g, ' ')
    });

    // Extract invitations - now matches "Number of invitations issued:** 400"
    const invitationsMatch = html.match(/Number of invitations issued[:\s*]+(\d+(?:,\d+)*)/i);
    const invitations = invitationsMatch ? parseInt(invitationsMatch[1].replace(/,/g, '')) : 0;
    console.log({ event: 'parse_invitations', id, match: invitationsMatch?.[0], value: invitations });

    // Extract CRS score - matches "CRS score of lowest-ranked candidate invited:** 539"
    const crsMatch = html.match(/CRS score of lowest-ranked candidate invited[:\s*]+(\d+)/i);
    const crs_min = crsMatch ? parseInt(crsMatch[1]) : 0;
    console.log({ event: 'parse_crs', id, match: crsMatch?.[0], value: crs_min });

    // Extract date - matches "Date and time of round:** October 22, 2024 at 14:07:18 UTC"
    const dateMatch = html.match(/Date and time of round[:\s*]+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,\s+\d{4}\s+at\s+\d+:\d+:\d+\s+UTC)/i);
    
    let date = new Date().toISOString();
    if (dateMatch) {
      date = new Date(dateMatch[1]).toISOString();
    }

    // Determine type and category based on title or specific markers
    let type: 'general' | 'pnp' | 'cec' | 'category' = 'general';
    let category: string | undefined;

    if (html.includes('Provincial Nominee Program')) {
      type = 'pnp';
    } else if (html.includes('Canadian Experience Class')) {
      type = 'cec';
    } else if (html.includes('Category-based')) {
      type = 'category';
      
      // Extract category name from title or headers
      const categoryMatch = html.match(/Category-based[^:]*:\s*([^\n*]+)/i);
      if (categoryMatch) {
        category = categoryMatch[1].trim();
      }
    }

    // Extract tie-break timestamp - matches "Tie-breaking rule:** October 19, 2024 at 21:53:18 UTC"
    let tiebreak_ts: string | undefined;
    const tiebreakMatch = html.match(/Tie-breaking rule[:\s*]+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,\s+\d{4}\s+at\s+\d+:\d+:\d+\s+UTC)/i);
    if (tiebreakMatch) {
      tiebreak_ts = new Date(tiebreakMatch[1]).toISOString();
    }

    // Validate data - reject clearly invalid values
    if (!invitations || invitations <= 1 || !crs_min || crs_min <= 10) {
      console.log({ 
        event: 'parse_invalid_data', 
        id, 
        invitations, 
        crs_min,
        reason: 'Invitations must be > 1 and CRS must be > 10'
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