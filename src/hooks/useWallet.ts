import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    // Ensure wallet exists
    await supabase.rpc("ensure_wallet", { p_user_id: user.id });

    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    setBalance(data?.balance ?? 0);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const createDeposit = async (amount: number, method: "pix" | "redirect" = "redirect") => {
    const { data, error } = await supabase.functions.invoke("create-mp-payment", {
      body: { amount, method },
    });

    if (error) throw new Error("Erro ao criar pagamento");
    return data as { init_point?: string; txn_id: string; qr_code?: string; qr_code_base64?: string; method?: string };
  };

  return { balance, loading, fetchBalance, createDeposit };
}
