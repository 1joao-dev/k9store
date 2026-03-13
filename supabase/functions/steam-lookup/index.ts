import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { steamId } = await req.json();
    if (!steamId) {
      return new Response(JSON.stringify({ error: "steamId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanId = steamId.trim().replace(/\/$/, "");
    const id = cleanId.includes("steamcommunity.com")
      ? cleanId.split("/").filter(Boolean).pop()
      : cleanId;

    // Try custom URL first
    let res = await fetch(`https://steamcommunity.com/id/${id}/?xml=1`);
    let text = await res.text();

    if (text.includes("<error>")) {
      // Try as Steam64 ID
      res = await fetch(`https://steamcommunity.com/profiles/${id}/?xml=1`);
      text = await res.text();
    }

    if (text.includes("<error>")) {
      return new Response(JSON.stringify({ error: "Perfil não encontrado. Verifique o nome de usuário (custom URL) da Steam." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const get = (tag: string) => {
      const m = text.match(new RegExp(`<${tag}><!\\[CDATA\\[(.+?)\\]\\]></${tag}>`)) ||
                text.match(new RegExp(`<${tag}>(.+?)</${tag}>`));
      return m?.[1] || null;
    };

    const profile = {
      name: get("steamID"),
      steamID64: get("steamID64"),
      vacBanned: text.includes("<vacBanned>1</vacBanned>"),
      onlineState: get("onlineState"),
      memberSince: get("memberSince"),
      avatarFull: get("avatarFull"),
    };

    return new Response(JSON.stringify(profile), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
