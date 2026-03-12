
-- Product plans table
CREATE TABLE public.product_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view plans
CREATE POLICY "Anyone can view plans" ON public.product_plans
  FOR SELECT USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert plans" ON public.product_plans
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plans" ON public.product_plans
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plans" ON public.product_plans
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
