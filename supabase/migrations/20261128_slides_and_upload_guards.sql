-- Posts can be one photo or a slideshow (Instagram carousel, up to 10). No video
-- for now. Fisher can also list the exact shots it still needs for a post.
alter table public.posts
  add column if not exists slides text[] not null default '{}',
  add column if not exists shots text[] not null default '{}';

update public.posts set slides = array[media_path] where media_path is not null and slides = '{}';

-- Guard rails on uploads, enforced by Supabase itself so nobody can get around
-- them from the browser: photos only, 10 MB each.
update storage.buckets
  set file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  where id = 'clips';

-- And no more than 60 uploads per owner in a week.
create or replace function public.clip_uploads_ok()
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select count(*) < 60
  from storage.objects
  where bucket_id = 'clips'
    and (storage.foldername(name))[1] = auth.uid()::text
    and created_at > now() - interval '7 days';
$$;
revoke all on function public.clip_uploads_ok() from public, anon;
grant execute on function public.clip_uploads_ok() to authenticated;

drop policy if exists "owners upload own clips" on storage.objects;
create policy "owners upload own clips" on storage.objects for insert
  with check (
    bucket_id = 'clips'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.clip_uploads_ok()
  );
