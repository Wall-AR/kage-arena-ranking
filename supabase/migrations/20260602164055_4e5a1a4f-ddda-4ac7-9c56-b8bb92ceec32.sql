
-- Public read for banner files in Temas bucket under banners/ prefix
CREATE POLICY "Banner images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'Temas' AND (storage.foldername(name))[1] = 'banners');

CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Temas'
  AND (storage.foldername(name))[1] = 'banners'
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admins can update banner images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Temas'
  AND (storage.foldername(name))[1] = 'banners'
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Temas'
  AND (storage.foldername(name))[1] = 'banners'
  AND public.is_admin(auth.uid())
);
