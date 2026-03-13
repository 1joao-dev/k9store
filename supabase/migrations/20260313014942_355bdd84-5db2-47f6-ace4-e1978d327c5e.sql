
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND has_admin_access(auth.uid())) WITH CHECK (bucket_id = 'product-images' AND has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND has_admin_access(auth.uid()));
