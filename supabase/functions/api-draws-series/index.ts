import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const window = url.searchParams.get('window') || '12m';
    const type = url.searchParams.get('type') || '';

    // Calculate date range
    const now = new Date();
    let startDate = new Date(now);
    
    switch (window) {
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '12m':
        startDate.setMonth(now.getMonth() - 12);
        break;
      case 'all':
        startDate = new Date('2015-01-01'); // Express Entry started in 2015
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid window parameter. Use 6m, 12m, or all' }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from('express_entry_draws')
      .select('*')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: draws, error } = await query;

    if (error) {
      console.error({ event: 'query_error', error: error.message });
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the latest update timestamp
    const { data: latestUpdate } = await supabase
      .from('express_entry_draws')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    // Format data for chart
    const labels: string[] = [];
    const crs: number[] = [];
    const itas: number[] = [];
    const items: any[] = [];

    draws?.forEach(draw => {
      const date = new Date(draw.date).toISOString().split('T')[0];
      labels.push(date);
      crs.push(draw.crs_min);
      itas.push(draw.invitations);
      
      items.push({
        date,
        title: formatDrawTitle(draw.type, draw.category),
        points: draw.crs_min,
        invitations: draw.invitations,
        category: draw.category,
        source_url: draw.source_url,
        type: draw.type,
      });
    });

    const result = {
      labels,
      crs,
      itas,
      items,
      updatedAt: latestUpdate?.updated_at || new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error({ event: 'api_error', error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatDrawTitle(type: string, category?: string): string {
  if (type === 'category' && category) {
    return `Category: ${category}`;
  }
  
  const titles: Record<string, string> = {
    general: 'General Round',
    pnp: 'Provincial Nominee',
    cec: 'Canadian Experience Class',
    category: 'Category-based',
  };
  
  return titles[type] || 'Express Entry Draw';
}