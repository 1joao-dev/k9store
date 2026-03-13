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
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // MP sends different notification types
    if (body.type !== "payment" && body.action !== "payment.updated" && body.action !== "payment.created") {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.log("No payment ID in webhook");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) {
      console.error("Missing MP token");
      return new Response("Config error", { status: 500, headers: corsHeaders });
    }

    // Fetch payment details from MP
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });
    const payment = await paymentRes.json();
    console.log("Payment status:", payment.status, "external_reference:", payment.external_reference);

    if (payment.status !== "approved") {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Parse external reference
    let ref: { txn_id: string; user_id: string };
    try {
      ref = JSON.parse(payment.external_reference);
    } catch {
      console.error("Invalid external_reference:", payment.external_reference);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if already processed
    const { data: txn } = await adminClient
      .from("wallet_transactions")
      .select("status")
      .eq("id", ref.txn_id)
      .single();

    if (txn?.status === "completed") {
      console.log("Transaction already completed, skipping");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Add balance
    const amount = payment.transaction_amount;
    await adminClient.rpc("add_wallet_balance", {
      p_user_id: ref.user_id,
      p_amount: amount,
      p_payment_id: ref.txn_id,
    });

    // Update transaction with actual MP payment ID
    await adminClient
      .from("wallet_transactions")
      .update({ mp_payment_id: String(paymentId) })
      .eq("id", ref.txn_id);

    console.log(`Balance added: R$ ${amount} for user ${ref.user_id}`);

    // Send Discord notification for payment confirmed
    try {
      const fnUrl = `${supabaseUrl}/functions/v1/discord-notify`;
      await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          type: "payment_confirmed",
          user_id: ref.user_id,
          data: { amount },
        }),
      });
    } catch (notifyErr) {
      console.error("Discord notify error:", notifyErr);
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
