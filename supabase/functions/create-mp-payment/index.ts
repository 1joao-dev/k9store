import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, method } = await req.json();
    if (!amount || amount < 1) {
      return new Response(JSON.stringify({ error: "Valor mínimo: R$ 1,00" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) {
      return new Response(JSON.stringify({ error: "Configuração do Mercado Pago ausente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    await adminClient.rpc("ensure_wallet", { p_user_id: user.id });

    const { data: txn, error: txnError } = await adminClient
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        type: "deposit",
        amount,
        description: `Depósito de R$ ${Number(amount).toFixed(2)}`,
        status: "pending",
      })
      .select("id")
      .single();

    if (txnError) {
      console.error("Transaction error:", txnError);
      return new Response(JSON.stringify({ error: "Erro ao criar transação" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/mp-webhook`;

    // If method is "pix", create a direct Pix payment with QR code
    if (method === "pix") {
      const pixPayment = {
        transaction_amount: Number(amount),
        payment_method_id: "pix",
        payer: {
          email: user.email,
        },
        description: `Depósito K9 Store - R$ ${Number(amount).toFixed(2)}`,
        external_reference: JSON.stringify({ txn_id: txn.id, user_id: user.id }),
        notification_url: webhookUrl,
      };

      const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpToken}`,
          "X-Idempotency-Key": txn.id,
        },
        body: JSON.stringify(pixPayment),
      });

      const mpData = await mpRes.json();
      console.log("Pix payment response status:", mpRes.status);

      if (!mpRes.ok) {
        console.error("MP Pix error:", JSON.stringify(mpData));
        return new Response(JSON.stringify({ error: "Erro ao gerar Pix", details: mpData.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await adminClient
        .from("wallet_transactions")
        .update({ mp_payment_id: String(mpData.id) })
        .eq("id", txn.id);

      const pixInfo = mpData.point_of_interaction?.transaction_data;

      return new Response(
        JSON.stringify({
          method: "pix",
          qr_code: pixInfo?.qr_code || null,
          qr_code_base64: pixInfo?.qr_code_base64 || null,
          txn_id: txn.id,
          payment_id: mpData.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: create checkout preference (redirect)
    const preference = {
      items: [
        {
          title: `Depósito K9 Store - R$ ${Number(amount).toFixed(2)}`,
          quantity: 1,
          unit_price: Number(amount),
          currency_id: "BRL",
        },
      ],
      external_reference: JSON.stringify({ txn_id: txn.id, user_id: user.id }),
      notification_url: webhookUrl,
      back_urls: {
        success: `https://k9store.lovable.app`,
        failure: `https://k9store.lovable.app`,
        pending: `https://k9store.lovable.app`,
      },
      auto_return: "approved",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpToken}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error("MP error:", mpData);
      return new Response(JSON.stringify({ error: "Erro ao criar pagamento" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient
      .from("wallet_transactions")
      .update({ mp_payment_id: mpData.id })
      .eq("id", txn.id);

    return new Response(
      JSON.stringify({
        method: "redirect",
        init_point: mpData.init_point,
        txn_id: txn.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
