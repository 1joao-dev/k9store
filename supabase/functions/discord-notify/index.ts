import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DISCORD_API = "https://discord.com/api/v10";

async function getDMChannel(botToken: string, userId: string) {
  const channelRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: userId }),
  });

  if (!channelRes.ok) {
    const err = await channelRes.text();
    console.error(`Failed to create DM channel for ${userId}:`, err);
    return null;
  }

  return await channelRes.json();
}

async function sendChannelMessage(botToken: string, channelId: string, payload: Record<string, unknown>) {
  const msgRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!msgRes.ok) {
    const err = await msgRes.text();
    console.error(`Failed to send message:`, err);
    return false;
  }
  await msgRes.text();
  return true;
}

async function sendDM(botToken: string, userId: string, embed: Record<string, unknown>, extraContent?: string) {
  const channel = await getDMChannel(botToken, userId);
  if (!channel) return false;

  // Send the embed first
  const sent = await sendChannelMessage(botToken, channel.id, { embeds: [embed] });
  if (!sent) return false;

  // If there's extra content (like transcript), send as a plain text message
  if (extraContent) {
    // Discord message limit is 2000 chars, split into chunks
    const chunks: string[] = [];
    let remaining = extraContent;
    while (remaining.length > 0) {
      chunks.push(remaining.slice(0, 1990));
      remaining = remaining.slice(1990);
    }
    for (const chunk of chunks) {
      await sendChannelMessage(botToken, channel.id, { content: `\`\`\`\n${chunk}\n\`\`\`` });
    }
  }

  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("DISCORD_BOT_TOKEN");
    if (!botToken) {
      console.error("DISCORD_BOT_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Bot token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { type, user_id, data } = await req.json();

    // Fetch user's discord_id
    const { data: profile } = await adminClient
      .from("profiles")
      .select("discord_id, username")
      .eq("id", user_id)
      .single();

    if (!profile?.discord_id) {
      console.log(`User ${user_id} has no Discord ID linked, skipping notification`);
      return new Response(JSON.stringify({ success: false, reason: "no_discord_id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const username = profile.username || "Cliente";
    let embed: Record<string, unknown>;

    switch (type) {
      case "product_delivered":
        embed = {
          title: "🎁 Produto Entregue!",
          description: `Olá **${username}**! Seu produto foi entregue com sucesso.`,
          color: 0x22c55e,
          fields: [
            { name: "Produto", value: data.product_name || "—", inline: true },
            ...(data.plan_name ? [{ name: "Plano", value: data.plan_name, inline: true }] : []),
            { name: "Valor", value: `R$ ${Number(data.price || 0).toFixed(2).replace(".", ",")}`, inline: true },
          ],
          footer: { text: "K9 Store — Obrigado pela compra!" },
          timestamp: new Date().toISOString(),
        };
        break;

      case "ticket_responded":
        embed = {
          title: "💬 Ticket Respondido",
          description: `Olá **${username}**! Seu ticket recebeu uma resposta.`,
          color: 0x3b82f6,
          fields: [
            { name: "Assunto", value: data.subject || "—", inline: false },
          ],
          footer: { text: "K9 Store — Acesse o site para ver a resposta." },
          timestamp: new Date().toISOString(),
        };
        break;

      case "ticket_closed":
        embed = {
          title: "🔒 Ticket Encerrado",
          description: `Olá **${username}**! Seu ticket foi encerrado.`,
          color: 0xef4444,
          fields: [
            { name: "Assunto", value: data.subject || "—", inline: false },
            ...(data.transcript ? [{ name: "📋 Transcript", value: data.transcript.slice(0, 1024), inline: false }] : []),
          ],
          footer: { text: "K9 Store — Abra um novo ticket se precisar." },
          timestamp: new Date().toISOString(),
        };
        break;

      case "ticket_assumed":
        embed = {
          title: "👤 Ticket Assumido",
          description: `Olá **${username}**! Um atendente assumiu seu ticket.`,
          color: 0xf59e0b,
          fields: [
            { name: "Assunto", value: data.subject || "—", inline: false },
          ],
          footer: { text: "K9 Store — Em breve você receberá uma resposta." },
          timestamp: new Date().toISOString(),
        };
        break;

      case "payment_confirmed":
        embed = {
          title: "✅ Pagamento Confirmado",
          description: `Olá **${username}**! Seu pagamento foi confirmado e o saldo adicionado.`,
          color: 0x8b5cf6,
          fields: [
            { name: "Valor", value: `R$ ${Number(data.amount || 0).toFixed(2).replace(".", ",")}`, inline: true },
          ],
          footer: { text: "K9 Store — Seu saldo já está disponível!" },
          timestamp: new Date().toISOString(),
        };
        break;

      default:
        console.log(`Unknown notification type: ${type}`);
        return new Response(JSON.stringify({ success: false, reason: "unknown_type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const sent = await sendDM(botToken, profile.discord_id, embed);

    return new Response(JSON.stringify({ success: sent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Discord notify error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
