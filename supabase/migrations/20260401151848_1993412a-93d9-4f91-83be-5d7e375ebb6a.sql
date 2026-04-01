
CREATE OR REPLACE FUNCTION public.secure_purchase(
  p_user_id uuid,
  p_product_id uuid,
  p_plan_id uuid,
  p_payment_method text DEFAULT 'saldo'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_real_price numeric;
  v_plan_name text;
  v_product_name text;
  v_current_balance numeric;
  v_stock_content text;
  v_order_id uuid;
BEGIN
  -- 1. Look up the REAL price from the database (never trust frontend)
  SELECT pp.price, pp.name INTO v_real_price, v_plan_name
  FROM public.product_plans pp
  WHERE pp.id = p_plan_id AND pp.product_id = p_product_id;
  
  IF v_real_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plano não encontrado');
  END IF;

  -- 2. Get product name
  SELECT p.name INTO v_product_name
  FROM public.products p
  WHERE p.id = p_product_id;

  IF v_product_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Produto não encontrado');
  END IF;

  -- 3. If paying with balance, validate and deduct
  IF p_payment_method = 'saldo' THEN
    SELECT balance INTO v_current_balance
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL OR v_current_balance < v_real_price THEN
      RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente');
    END IF;

    UPDATE public.wallets
    SET balance = balance - v_real_price, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- 4. Claim stock item
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
  RETURNING content INTO v_stock_content;

  -- 5. Create order with REAL price
  INSERT INTO public.orders (user_id, product_id, plan_id, product_name, plan_name, price, status, delivered_content, payment_method)
  VALUES (p_user_id, p_product_id, p_plan_id, v_product_name, v_plan_name, v_real_price, 'completed', v_stock_content, p_payment_method)
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'product_name', v_product_name,
    'plan_name', v_plan_name,
    'price', v_real_price,
    'content', v_stock_content
  );
END;
$$;
