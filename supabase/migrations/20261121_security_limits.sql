-- Security pass, Nov 21 2026.

-- 1. Daily usage caps. Owners can read their own counts but never write them,
--    so deleting chat or message rows doesn't reset a limit.
create table public.usage_daily (
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  kind text not null check (kind in ('chat', 'text')),
  count integer not null default 0,
  primary key (owner_id, day, kind)
);
alter table public.usage_daily enable row level security;
create policy "read own usage" on public.usage_daily for select using (owner_id = auth.uid());

-- Counts one use for the signed-in owner and says whether they're still under
-- today's cap: 50 chat messages, 30 texts. Limits live here, not in the caller.
create or replace function public.use_quota(p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  cap integer;
begin
  if auth.uid() is null then
    return false;
  end if;
  cap := case p_kind when 'chat' then 50 when 'text' then 30 else 0 end;
  if cap = 0 then
    return false;
  end if;
  insert into public.usage_daily (owner_id, day, kind, count)
  values (auth.uid(), current_date, p_kind, 1)
  on conflict (owner_id, day, kind) do update set count = public.usage_daily.count + 1
  returning count into n;
  return n <= cap;
end;
$$;
revoke all on function public.use_quota(text) from public, anon;
grant execute on function public.use_quota(text) to authenticated;

-- 2. Signed-out visitors can't call delete_my_account (it did nothing for them,
--    but there's no reason to expose it).
revoke execute on function public.delete_my_account() from anon;

-- 3. The clips bucket takes phone videos only, up to 200 MB each.
update storage.buckets
set file_size_limit = 209715200,
    allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/3gpp']
where id = 'clips';
