-- Two public-read buckets. Files live under a folder named after the owner's user id,
-- so the policies can check ownership from the path.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('need-photos', 'need-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public read images" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('avatars','need-photos'));

create policy "users upload into their own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars','need-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own files" on storage.objects
  for update to authenticated
  using (bucket_id in ('avatars','need-photos') and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('avatars','need-photos') and (storage.foldername(name))[1] = auth.uid()::text);
