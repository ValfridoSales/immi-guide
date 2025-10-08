import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

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

    // Fetch the official IRCC page with all historical rounds
    const irccUrl = 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html';
    console.log({ event: 'fetching_html', url: irccUrl });

    const htmlResponse = await fetch(irccUrl);
    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch IRCC page: ${htmlResponse.status}`);
    }

    const html = await htmlResponse.text();
    console.log({ event: 'html_fetched', size: html.length });

    // Parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // Find the main table with draw data (has data-wb-tables attribute)
    const table = doc.querySelector('table[data-wb-tables]');
    if (!table) {
      throw new Error('Could not find draws table on page');
    }

    console.log({ event: 'table_found' });

    let drawsData: DrawData[] = [];
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    // Get all rows from tbody
    const rows = table.querySelectorAll('tbody tr');
    console.log({ event: 'rows_found', count: rows.length });

    for (const row of rows) {
      try {
        const cells = row.querySelectorAll('td');
        
        // Skip if not enough cells
        if (cells.length < 5) {
          console.log({ event: 'skip_row', reason: 'not_enough_cells', count: cells.length });
          continue;
        }

        // Extract draw number from first cell (contains <a href="...?q=371">371</a>)
        const firstCellLink = cells[0]?.querySelector('a');
        const drawIdText = firstCellLink?.textContent?.trim() || cells[0]?.textContent?.trim();
        const drawId = parseInt(drawIdText || '0');
        
        if (isNaN(drawId) || drawId < 1) {
          console.log({ event: 'skip_row', reason: 'invalid_id', text: drawIdText });
          continue;
        }

        // Get date from second cell (format: "October 6, 2025")
        const dateText = cells[1]?.textContent?.trim() || '';
        const dateOrder = cells[1]?.getAttribute('data-order'); // Format: "2025-10-06"
        
        // Parse date using data-order attribute if available, otherwise parse text
        let drawDate: Date;
        try {
          if (dateOrder) {
            drawDate = new Date(dateOrder);
          } else {
            drawDate = new Date(dateText);
          }
          
          if (isNaN(drawDate.getTime())) {
            console.log({ event: 'skip_row', reason: 'invalid_date', dateText, dateOrder });
            continue;
          }
        } catch {
          console.log({ event: 'skip_row', reason: 'date_parse_error', dateText });
          continue;
        }

        // Get program/category from third cell
        const programText = cells[2]?.textContent?.trim() || '';
        
        // Get invitations from fourth cell (remove commas: "4,500" -> 4500)
        const invitationsText = cells[3]?.textContent?.trim() || '';
        const invitations = parseInt(invitationsText.replace(/,/g, ''));
        
        if (isNaN(invitations)) {
          console.log({ event: 'skip_row', reason: 'invalid_invitations', text: invitationsText });
          continue;
        }

        // Get CRS score from fifth cell
        const crsText = cells[4]?.textContent?.trim() || '';
        const crsMin = parseInt(crsText.replace(/,/g, ''));
        
        if (isNaN(crsMin)) {
          console.log({ event: 'skip_row', reason: 'invalid_crs', text: crsText });
          continue;
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
          source_url: `https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds/invitations.html?q=${drawId}`,
        };

        drawsData.push(drawData);

        // Log only every 50th draw to avoid too many logs
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
        console.error({ event: 'row_parse_error', error: error.message });
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
