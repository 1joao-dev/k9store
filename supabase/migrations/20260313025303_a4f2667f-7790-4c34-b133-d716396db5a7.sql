
-- Product stock: digital keys/items per product+plan
CREATE TABLE public.product_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.product_plans(id) ON DELETE CASCADE,
  content text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stock" ON public.product_stock FOR ALL TO authenticated
  USING (has_admin_access(auth.uid()))
  WITH CHECK (has_admin_access(auth.uid()));

-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  plan_id uuid REFERENCES public.product_plans(id),
  product_name text NOT NULL,
  plan_name text,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  delivered_content text,
  payment_method text NOT NULL DEFAULT 'saldo',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated can insert own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated
  USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated
  USING (has_admin_access(auth.uid()))
  WITH CHECK (has_admin_access(auth.uid()));

-- Function to claim stock item for an order
CREATE OR REPLACE FUNCTION public.claim_stock_item(p_product_id uuid, p_plan_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_content text;
BEGIN
  UPDATE public.product_stock
  SET used = true
  WHERE id = (
    SELECT id FROM public.product_stock
    WHERE product_id = p_product_id
      AND (plan_id = p_plan_id OR (p_plan_id IS NULL AND plan_id IS NULL))
      AND used = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING content INTO v_content;
  
  RETURN v_content;
END;
$$;
