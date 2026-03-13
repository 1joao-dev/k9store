
CREATE TABLE public.product_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tutorial', 'download', 'fix')),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product resources" ON public.product_resources
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage product resources" ON public.product_resources
  FOR ALL TO authenticated
  USING (has_admin_access(auth.uid()))
  WITH CHECK (has_admin_access(auth.uid()));
