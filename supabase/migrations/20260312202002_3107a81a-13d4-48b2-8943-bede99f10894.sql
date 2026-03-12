
-- Allow public insert/update/delete on products (admin will be secured later)
CREATE POLICY "Allow insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete products" ON public.products FOR DELETE USING (true);

-- Allow public insert/update/delete on giveaways
CREATE POLICY "Allow insert giveaways" ON public.giveaways FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update giveaways" ON public.giveaways FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete giveaways" ON public.giveaways FOR DELETE USING (true);
