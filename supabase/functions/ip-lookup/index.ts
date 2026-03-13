import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type IpWhoResponse = {
  success: boolean;
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: { id?: string };
  connection?: { isp?: string; org?: string; asn?: number };
  message?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ip } = await req.json();
    const query = typeof ip === "string" ? ip.trim() : "";
    const endpoint = query ? `https://ipwho.is/${encodeURIComponent(query)}` : "https://ipwho.is/";

    const externalResponse = await fetch(endpoint);
    const data = (await externalResponse.json()) as IpWhoResponse;

    if (!externalResponse.ok || data.success === false) {
      return new Response(
        JSON.stringify({
          status: "fail",
          message: data.message || "Não foi possível consultar o IP.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalized = {
      status: "success",
      query: data.ip ?? query,
      country: data.country ?? null,
      regionName: data.region ?? null,
      city: data.city ?? null,
      zip: data.postal ?? null,
      lat: data.latitude ?? null,
      lon: data.longitude ?? null,
      timezone: data.timezone?.id ?? null,
      isp: data.connection?.isp ?? null,
      org: data.connection?.org ?? null,
      as: data.connection?.asn ? `AS${data.connection.asn}` : null,
    };

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ status: "fail", message: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
