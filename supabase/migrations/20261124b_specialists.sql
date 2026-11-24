-- Fisher's specialists: posters he designs, and a daily cap on specialist calls.

create table if not exists public.posters (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  spec jsonb not null,
  media_path text,
  created_at timestamptz not null default now()
);
create index if not exists posters_business_idx on public.posters(business_id, created_at desc);
alter table public.posters enable row level security;
drop policy if exists "own posters" on public.posters;
create policy "own posters" on public.posters for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- Specialist calls get their own cap: 20 a day.
alter table public.usage_daily drop constraint if exists usage_daily_kind_check;
alter table public.usage_daily add constraint usage_daily_kind_check check (kind in ('chat', 'text', 'pack', 'skill'));

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
  cap := case p_kind when 'chat' then 50 when 'text' then 30 when 'pack' then 5 when 'skill' then 20 else 0 end;
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
