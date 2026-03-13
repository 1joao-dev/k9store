
-- Create a helper function that checks if user is admin-level (admin or dono)
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'dono')
  )
$$;

-- Update all RLS policies to use has_admin_access instead of has_role(..., 'admin')

-- products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (has_admin_access(auth.uid())) WITH CHECK (has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (has_admin_access(auth.uid()));

-- product_plans
DROP POLICY IF EXISTS "Admins can insert plans" ON public.product_plans;
CREATE POLICY "Admins can insert plans" ON public.product_plans FOR INSERT TO authenticated WITH CHECK (has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can update plans" ON public.product_plans;
CREATE POLICY "Admins can update plans" ON public.product_plans FOR UPDATE TO authenticated USING (has_admin_access(auth.uid())) WITH CHECK (has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete plans" ON public.product_plans;
CREATE POLICY "Admins can delete plans" ON public.product_plans FOR DELETE TO authenticated USING (has_admin_access(auth.uid()));

-- giveaways
DROP POLICY IF EXISTS "Admins can insert giveaways" ON public.giveaways;
CREATE POLICY "Admins can insert giveaways" ON public.giveaways FOR INSERT TO authenticated WITH CHECK (has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can update giveaways" ON public.giveaways;
CREATE POLICY "Admins can update giveaways" ON public.giveaways FOR UPDATE TO authenticated USING (has_admin_access(auth.uid())) WITH CHECK (has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete giveaways" ON public.giveaways;
CREATE POLICY "Admins can delete giveaways" ON public.giveaways FOR DELETE TO authenticated USING (has_admin_access(auth.uid()));

-- tickets
DROP POLICY IF EXISTS "Admins can view tickets" ON public.tickets;
CREATE POLICY "Admins can view tickets" ON public.tickets FOR SELECT TO authenticated USING (has_admin_access(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;
CREATE POLICY "Admins can update tickets" ON public.tickets FOR UPDATE TO authenticated USING (has_admin_access(auth.uid())) WITH CHECK (has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete tickets" ON public.tickets;
CREATE POLICY "Admins can delete tickets" ON public.tickets FOR DELETE TO authenticated USING (has_admin_access(auth.uid()));
