-- Create wallets table
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can insert wallets" ON public.wallets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT TO authenticated USING (has_admin_access(auth.uid()));

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'deposit',
  amount numeric NOT NULL,
  description text,
  mp_payment_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON public.wallet_transactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (has_admin_access(auth.uid()));

-- Function to ensure wallet exists for user
CREATE OR REPLACE FUNCTION public.ensure_wallet(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Function to add balance (called by webhook edge function with service role)
CREATE OR REPLACE FUNCTION public.add_wallet_balance(p_user_id uuid, p_amount numeric, p_payment_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM ensure_wallet(p_user_id);
  UPDATE public.wallets SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = p_user_id;
  UPDATE public.wallet_transactions SET status = 'completed'
  WHERE mp_payment_id = p_payment_id AND user_id = p_user_id;
END;
$$;