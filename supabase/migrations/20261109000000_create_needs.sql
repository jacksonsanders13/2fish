-- 2fish: the needs board.
--
-- Everyone (signed in or not) can read the board. People sign in
-- anonymously from the browser, so posting and helping don't need an
-- account yet. Nobody can UPDATE rows directly: status changes go through
-- the functions at the bottom, which check who is allowed to do what.

create table public.needs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  title text not null check (char_length(btrim(title)) between 1 and 80),
  category text not null check (category in ('Baby', 'Food', 'Clothing', 'Household', 'School', 'Hygiene', 'Other')),
  story text not null default '' check (char_length(story) <= 400),
  zip text not null check (zip ~ '^[0-9]{5}$'),
  area text not null default '' check (char_length(area) <= 40),
  display_name text not null default '' check (char_length(display_name) <= 24),
  needed_by date,

  in_person boolean not null default true,
  meet_spot text not null default '' check (char_length(meet_spot) <= 60),
  wishlist_url text not null default '' check (
    wishlist_url = '' or (wishlist_url ~* '^https?://' and char_length(wishlist_url) <= 300)
  ),

  status text not null default 'open' check (status in ('open', 'pledged', 'done')),
  helper_id uuid references auth.users (id) on delete set null,
  helper_method text check (helper_method in ('inperson', 'wishlist')),
  helper_note text not null default '' check (char_length(helper_note) <= 140),

  created_at timestamptz not null default now(),

  -- at least one way to receive help, and a spot if it's in person
  constraint needs_has_a_way check (in_person or wishlist_url <> ''),
  constraint needs_spot_when_in_person check (not in_person or char_length(btrim(meet_spot)) > 0),
  -- an open need has no helper
  constraint needs_open_has_no_helper check (status <> 'open' or (helper_id is null and helper_method is null))
);

create index needs_created_at_idx on public.needs (created_at desc);
create index needs_zip_idx on public.needs (zip);
create index needs_poster_id_idx on public.needs (poster_id);
create index needs_helper_id_idx on public.needs (helper_id);

alter table public.needs enable row level security;

create policy "Anyone can read the board"
  on public.needs for select
  to anon, authenticated
  using (true);

create policy "People post needs as themselves"
  on public.needs for insert
  to authenticated
  with check (
    poster_id = (select auth.uid())
    and status = 'open'
    and helper_id is null
    and helper_method is null
    and helper_note = ''
  );

create policy "Posters can remove their own open needs"
  on public.needs for delete
  to authenticated
  using (poster_id = (select auth.uid()) and status = 'open');

-- Tighten table grants to match the policies (no direct updates at all).
revoke all on public.needs from anon, authenticated;
grant select on public.needs to anon, authenticated;
grant insert, delete on public.needs to authenticated;

-- ---------------------------------------------------------------------------
-- Status changes
-- ---------------------------------------------------------------------------

-- "I'll help": only on someone else's open need, one helper per need.
create function public.pledge_need(need_id uuid, method text, note text default '')
returns public.needs
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  result public.needs;
begin
  if me is null then
    raise exception 'Sign in to help.' using errcode = '28000';
  end if;
  if method not in ('inperson', 'wishlist') then
    raise exception 'Unknown way to help.' using errcode = '22023';
  end if;

  update public.needs n
     set status = 'pledged',
         helper_id = me,
         helper_method = method,
         helper_note = left(btrim(coalesce(note, '')), 140)
   where n.id = need_id
     and n.status = 'open'
     and n.poster_id <> me
     and ((method = 'inperson' and n.in_person) or (method = 'wishlist' and n.wishlist_url <> ''))
  returning n.* into result;

  if result.id is null then
    raise exception 'This need is no longer open for help. Someone may have just offered.' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

-- Helper backs out; the need opens up again.
create function public.cancel_pledge(need_id uuid)
returns public.needs
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.needs;
begin
  update public.needs n
     set status = 'open', helper_id = null, helper_method = null, helper_note = ''
   where n.id = need_id
     and n.status = 'pledged'
     and n.helper_id = auth.uid()
  returning n.* into result;

  if result.id is null then
    raise exception 'That offer could not be cancelled.' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

-- Poster confirms it arrived.
create function public.mark_received(need_id uuid)
returns public.needs
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.needs;
begin
  update public.needs n
     set status = 'done'
   where n.id = need_id
     and n.status = 'pledged'
     and n.poster_id = auth.uid()
  returning n.* into result;

  if result.id is null then
    raise exception 'That need could not be marked received.' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

revoke execute on function public.pledge_need(uuid, text, text) from public, anon;
revoke execute on function public.cancel_pledge(uuid) from public, anon;
revoke execute on function public.mark_received(uuid) from public, anon;
grant execute on function public.pledge_need(uuid, text, text) to authenticated;
grant execute on function public.cancel_pledge(uuid) to authenticated;
grant execute on function public.mark_received(uuid) to authenticated;

-- Live updates for the feed.
alter publication supabase_realtime add table public.needs;
