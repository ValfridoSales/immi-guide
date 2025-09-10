import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const pdfApiKey = Deno.env.get("PDF_API_KEY");
    if (!pdfApiKey) {
      console.error("PDF_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "PDF service not configured" }),
        {
          status: 500,
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
    console.log("Generating PDF for URL:", previewUrl);

    // Call PDFShift API to generate PDF
    const pdfResponse = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`api:${pdfApiKey}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: previewUrl,
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

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error("PDFShift error:", errorText);
      throw new Error(`PDF generation failed: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log("PDF generated successfully, size:", pdfBuffer.byteLength);

    // Return PDF as response
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `resultado-${resultId}-${currentDate}.pdf`;

    return new Response(pdfBuffer, {
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