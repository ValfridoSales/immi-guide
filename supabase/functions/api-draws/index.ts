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
    // Read parameters from either query params or body
    const url = new URL(req.url);
    let limit = url.searchParams.get('limit');
    let type = url.searchParams.get('type');
    let category = url.searchParams.get('category');
    let minCrs = url.searchParams.get('minCrs');

    // If not in query params, try body
    if (!limit && req.method === 'POST') {
      const body = await req.json();
      limit = body.limit;
      type = body.type;
      category = body.category;
      minCrs = body.minCrs;
    }

    const limitNum = parseInt(limit || '20');
    type = type || '';
    category = category || '';

    if (limitNum < 1 || limitNum > 100) {
      return new Response(
        JSON.stringify({ error: 'Limit must be between 1 and 100' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from('express_entry_draws')
      .select('*')
      .order('date', { ascending: false })
      .limit(limitNum);

    if (type) {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (minCrs) {
      const minCrsNum = parseInt(minCrs);
      if (!isNaN(minCrsNum)) {
        query = query.lte('crs_min', minCrsNum);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error({ event: 'query_error', error: error.message });
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ draws: data || [], count: data?.length || 0 }),
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