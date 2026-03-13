
CREATE OR REPLACE FUNCTION public.get_stock_counts()
RETURNS TABLE(product_id uuid, plan_id uuid, available_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT product_id, plan_id, COUNT(*) as available_count
  FROM public.product_stock
  WHERE used = false
  GROUP BY product_id, plan_id
$$;
