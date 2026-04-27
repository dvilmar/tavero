-- ============================================================
-- storage_policies.sql
-- Ejecutar DESPUÉS de crear el bucket "tavero-assets" en
-- Supabase Storage con visibilidad Public.
-- ============================================================

-- Lectura pública (cualquiera puede ver las imágenes)
create policy "public can read tavero-assets"
  on storage.objects for select
  to public
  using (bucket_id = 'tavero-assets');

-- Usuarios autenticados pueden subir imágenes
create policy "authenticated users can upload to tavero-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'tavero-assets');

-- Usuarios autenticados pueden reemplazar sus imágenes (upsert)
create policy "authenticated users can update tavero-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'tavero-assets');

-- Usuarios autenticados pueden borrar sus imágenes
create policy "authenticated users can delete from tavero-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'tavero-assets');
