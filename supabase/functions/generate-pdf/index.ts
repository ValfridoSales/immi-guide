import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PDFRequest {
  resultId: string;
  siteOrigin?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resultId, siteOrigin }: PDFRequest = await req.json();
    
    if (!resultId) {
      return new Response(
        JSON.stringify({ error: "resultId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Determine the site origin to render the preview page
    const originFromHeader = req.headers.get("origin") || req.headers.get("Origin") || undefined;
    const baseUrlRaw = siteOrigin || originFromHeader || Deno.env.get("PUBLIC_SITE_URL") || "";
    const baseUrl = baseUrlRaw.replace(/\/$/, "");

    if (!baseUrl) {
      console.error("Missing site origin. Provide siteOrigin in body or set PUBLIC_SITE_URL env.");
      return new Response(
        JSON.stringify({ error: "Site origin not provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const previewUrl = `${baseUrl}/pdf/preview?resultId=${resultId}`;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Navigate to the preview page
    await page.goto(previewUrl, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '18mm',
        right: '14mm',
        bottom: '18mm',
        left: '14mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    // Return PDF as response
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `resultado-${resultId}-${currentDate}.pdf`;

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error generating PDF:", error);
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