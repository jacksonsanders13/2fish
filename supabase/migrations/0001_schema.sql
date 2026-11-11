-- 2fish schema. Tables, indexes, triggers, and the functions the app calls.
-- RLS policies live in 0002_rls.sql, storage in 0003_storage.sql.
-- gen_random_uuid() is built into Postgres 13+, so no pgcrypto needed.


-- ---------- enums ----------
create type public.need_category as enum ('baby','food','clothing','household','school','medical','other');
create type public.need_urgency as enum ('low','normal','high');
create type public.need_status as enum ('open','pledged','fulfilled','closed');
create type public.fulfillment_method as enum ('in_person','wishlist','both');
create type public.report_target as enum ('need','profile','message');
create type public.report_status as enum ('open','resolved','dismissed');
create type public.notification_type as enum (
  'offer_received','offer_cancelled','need_fulfilled','message_received','report_update','system'
);

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_url text,
  area text check (area is null or char_length(area) <= 60),
  bio text check (bio is null or char_length(bio) <= 280),
  zip text check (zip is null or zip ~ '^\d{5}$'),
  -- approximate point for the ZIP, rounded to 2 decimals (about a kilometer). Never anything more precise.
  lat double precision check (lat is null or (lat between -90 and 90)),
  lng double precision check (lng is null or (lng between -180 and 180)),
  role text not null default 'user' check (role in ('user','admin')),
  banned_at timestamptz,
  email_notifications boolean not null default true,
  -- when they confirmed they're 18+ and accepted the terms (signup form, or onboarding for Google sign-ins)
  terms_accepted_at timestamptz,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- What other people are allowed to see of a profile. The base table stays private.
create view public.public_profiles
with (security_invoker = false) as
  select id, display_name, avatar_url, area, created_at, (banned_at is not null) as is_banned
  from public.profiles;

-- ---------- needs ----------
create table public.needs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) between 10 and 1000),
  category public.need_category not null,
  urgency public.need_urgency not null default 'normal',
  status public.need_status not null default 'open',
  fulfillment public.fulfillment_method not null default 'in_person',
  wishlist_url text check (wishlist_url is null or wishlist_url ~* '^https?://'),
  photo_path text,
  zip text not null check (zip ~ '^\d{5}$'),
  lat double precision not null,
  lng double precision not null,
  helper_id uuid references public.profiles(id) on delete set null,
  pledged_at timestamptz,
  fulfilled_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) stored,
  check ((status = 'pledged') = (helper_id is not null) or status in ('fulfilled','closed')),
  check (fulfillment = 'in_person' or wishlist_url is not null)
);
create index needs_status_created_idx on public.needs (status, created_at desc);
create index needs_poster_idx on public.needs (poster_id);
create index needs_helper_idx on public.needs (helper_id);
create index needs_lat_lng_idx on public.needs (lat, lng);
create index needs_search_idx on public.needs using gin (search);

-- ---------- threads & messages ----------
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.needs(id) on delete cascade,
  poster_id uuid not null references public.profiles(id) on delete cascade,
  helper_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (need_id, helper_id)
);
create index threads_poster_idx on public.threads (poster_id, last_message_at desc);
create index threads_helper_idx on public.threads (helper_id, last_message_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index messages_thread_idx on public.messages (thread_id, created_at);

-- who has read a thread up to when
create table public.thread_reads (
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

-- ---------- notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------- safety ----------
create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text not null check (char_length(reason) between 1 and 60),
  details text check (details is null or char_length(details) <= 1000),
  status public.report_status not null default 'open',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now()
);
create index reports_status_idx on public.reports (status, created_at desc);

-- ---------- helpers ----------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_banned(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = uid and banned_at is not null);
$$;

-- true when either person has blocked the other
create or replace function public.blocked_either_way(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- great-circle distance in miles
create or replace function public.miles_between(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision
language sql immutable
as $$
  select 3958.8 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger needs_updated_at before update on public.needs for each row execute function public.set_updated_at();

-- new auth user -> profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  name text;
begin
  name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, 'neighbor'), '@', 1)
  );
  insert into public.profiles (id, display_name, avatar_url, terms_accepted_at)
  values (
    new.id,
    left(name, 40),
    new.raw_user_meta_data ->> 'avatar_url',
    case when (new.raw_user_meta_data ->> 'terms_accepted') = 'true' then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- rate limits (enforced in the database so they can't be skipped) ----------

create or replace function public.check_need_rate_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  open_count int;
  recent_count int;
begin
  if public.is_banned(new.poster_id) then
    raise exception 'This account can''t post right now.' using errcode = 'P0001';
  end if;
  select count(*) into open_count from public.needs
    where poster_id = new.poster_id and status in ('open','pledged');
  if open_count >= 5 then
    raise exception 'You already have 5 open needs. Mark one fulfilled or close it first.' using errcode = 'P0001';
  end if;
  select count(*) into recent_count from public.needs
    where poster_id = new.poster_id and created_at > now() - interval '24 hours';
  if recent_count >= 5 then
    raise exception 'You''ve posted a lot today. Try again tomorrow.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger needs_rate_limit before insert on public.needs for each row execute function public.check_need_rate_limit();

create or replace function public.check_message_rate_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  recent_count int;
begin
  if new.sender_id is null then
    return new;
  end if;
  if public.is_banned(new.sender_id) then
    raise exception 'This account can''t send messages right now.' using errcode = 'P0001';
  end if;
  select count(*) into recent_count from public.messages
    where sender_id = new.sender_id and created_at > now() - interval '10 minutes';
  if recent_count >= 40 then
    raise exception 'Slow down a little. You can send more messages in a few minutes.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger messages_rate_limit before insert on public.messages for each row execute function public.check_message_rate_limit();

-- keep thread.last_message_at fresh
create or replace function public.touch_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.threads set last_message_at = new.created_at where id = new.thread_id;
  return new;
end;
$$;
create trigger messages_touch_thread after insert on public.messages for each row execute function public.touch_thread();

-- ---------- status changes go through these, never direct updates ----------

create or replace function public.offer_help(p_need_id uuid)
returns public.threads
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n public.needs;
  t public.threads;
  helper_name text;
begin
  if uid is null then raise exception 'Sign in to offer help.' using errcode = '42501'; end if;
  if public.is_banned(uid) then raise exception 'This account can''t offer help right now.' using errcode = '42501'; end if;

  select * into n from public.needs where id = p_need_id for update;
  if not found then raise exception 'That need no longer exists.' using errcode = 'P0002'; end if;
  if n.poster_id = uid then raise exception 'You can''t help with your own need.' using errcode = 'P0001'; end if;
  if n.status <> 'open' then raise exception 'Someone else already offered to help.' using errcode = 'P0001'; end if;
  if public.blocked_either_way(uid, n.poster_id) then raise exception 'You can''t help with this need.' using errcode = '42501'; end if;

  update public.needs set status = 'pledged', helper_id = uid, pledged_at = now() where id = p_need_id;

  insert into public.threads (need_id, poster_id, helper_id)
  values (p_need_id, n.poster_id, uid)
  on conflict (need_id, helper_id) do update set last_message_at = now()
  returning * into t;

  select display_name into helper_name from public.profiles where id = uid;
  insert into public.notifications (user_id, type, title, body, href)
  values (n.poster_id, 'offer_received', helper_name || ' can help with "' || n.title || '"',
          'Open the conversation to work out the details.', '/messages/' || t.id);
  return t;
end;
$$;

create or replace function public.cancel_offer(p_need_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n public.needs;
  helper_name text;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  select * into n from public.needs where id = p_need_id for update;
  if not found then raise exception 'That need no longer exists.' using errcode = 'P0002'; end if;
  if n.status <> 'pledged' or n.helper_id <> uid then
    raise exception 'You don''t have an active offer on this need.' using errcode = 'P0001';
  end if;
  update public.needs set status = 'open', helper_id = null, pledged_at = null where id = p_need_id;
  select display_name into helper_name from public.profiles where id = uid;
  insert into public.notifications (user_id, type, title, body, href)
  values (n.poster_id, 'offer_cancelled', helper_name || ' had to cancel on "' || n.title || '"',
          'Your need is open again for other neighbors.', '/needs/' || n.id);
end;
$$;

create or replace function public.mark_fulfilled(p_need_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n public.needs;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  select * into n from public.needs where id = p_need_id for update;
  if not found then raise exception 'That need no longer exists.' using errcode = 'P0002'; end if;
  if n.poster_id <> uid then raise exception 'Only the poster can mark this fulfilled.' using errcode = '42501'; end if;
  if n.status <> 'pledged' then raise exception 'There''s no helper on this need yet.' using errcode = 'P0001'; end if;
  update public.needs set status = 'fulfilled', fulfilled_at = now() where id = p_need_id;
  if n.helper_id is not null then
    insert into public.notifications (user_id, type, title, body, href)
    values (n.helper_id, 'need_fulfilled', '"' || n.title || '" is fulfilled. Thank you.',
            'A little was enough. Your neighbor marked it received.', '/needs/' || n.id);
  end if;
end;
$$;

create or replace function public.close_need(p_need_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n public.needs;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  select * into n from public.needs where id = p_need_id for update;
  if not found then raise exception 'That need no longer exists.' using errcode = 'P0002'; end if;
  if n.poster_id <> uid and not public.is_admin() then
    raise exception 'Only the poster can close this need.' using errcode = '42501';
  end if;
  if n.status in ('fulfilled','closed') then return; end if;
  update public.needs set status = 'closed', closed_at = now() where id = p_need_id;
  if n.helper_id is not null and n.helper_id <> uid then
    insert into public.notifications (user_id, type, title, body, href)
    values (n.helper_id, 'system', '"' || n.title || '" was closed',
            'The poster closed this need. Thanks for offering.', '/dashboard');
  end if;
end;
$$;

create or replace function public.reopen_need(p_need_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n public.needs;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  select * into n from public.needs where id = p_need_id for update;
  if not found then raise exception 'That need no longer exists.' using errcode = 'P0002'; end if;
  if n.poster_id <> uid then raise exception 'Only the poster can reopen this need.' using errcode = '42501'; end if;
  if n.status <> 'closed' then raise exception 'Only closed needs can be reopened.' using errcode = 'P0001'; end if;
  update public.needs set status = 'open', closed_at = null, helper_id = null, pledged_at = null where id = p_need_id;
end;
$$;

-- send a message in a thread you belong to
create or replace function public.send_message(p_thread_id uuid, p_body text)
returns public.messages
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  t public.threads;
  m public.messages;
  other uuid;
  sender_name text;
  need_title text;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  select * into t from public.threads where id = p_thread_id;
  if not found then raise exception 'That conversation no longer exists.' using errcode = 'P0002'; end if;
  if uid <> t.poster_id and uid <> t.helper_id then
    raise exception 'You''re not part of this conversation.' using errcode = '42501';
  end if;
  other := case when uid = t.poster_id then t.helper_id else t.poster_id end;
  if other is null then raise exception 'The other person is no longer on 2fish.' using errcode = 'P0001'; end if;
  if public.blocked_either_way(uid, other) then
    raise exception 'You can''t message this person.' using errcode = '42501';
  end if;

  insert into public.messages (thread_id, sender_id, body) values (p_thread_id, uid, p_body) returning * into m;

  insert into public.thread_reads (thread_id, user_id, last_read_at)
  values (p_thread_id, uid, m.created_at)
  on conflict (thread_id, user_id) do update set last_read_at = excluded.last_read_at;

  select display_name into sender_name from public.profiles where id = uid;
  select title into need_title from public.needs where id = t.need_id;
  -- one unread "new message" notification per thread, not one per message
  if not exists (
    select 1 from public.notifications
    where user_id = other and type = 'message_received' and href = '/messages/' || t.id and read_at is null
  ) then
    insert into public.notifications (user_id, type, title, body, href)
    values (other, 'message_received', 'New message from ' || sender_name,
            left(need_title, 60), '/messages/' || t.id);
  end if;
  return m;
end;
$$;

create or replace function public.mark_thread_read(p_thread_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return; end if;
  if not exists (select 1 from public.threads where id = p_thread_id and (poster_id = uid or helper_id = uid)) then
    return;
  end if;
  insert into public.thread_reads (thread_id, user_id, last_read_at) values (p_thread_id, uid, now())
  on conflict (thread_id, user_id) do update set last_read_at = now();
  update public.notifications set read_at = now()
  where user_id = uid and type = 'message_received' and href = '/messages/' || p_thread_id and read_at is null;
end;
$$;

-- block someone: also drops any active offer between the two of you
create or replace function public.block_user(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  if uid = p_user_id then raise exception 'You can''t block yourself.' using errcode = 'P0001'; end if;
  insert into public.blocks (blocker_id, blocked_id) values (uid, p_user_id) on conflict do nothing;
  update public.needs set status = 'open', helper_id = null, pledged_at = null
    where status = 'pledged' and ((poster_id = uid and helper_id = p_user_id) or (poster_id = p_user_id and helper_id = uid));
end;
$$;

-- ---------- feed query ----------
-- Returns open/pledged needs near a point. Runs as the caller so RLS applies.
create or replace function public.nearby_needs(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_miles double precision default null,
  p_category public.need_category default null,
  p_urgency public.need_urgency default null,
  p_query text default null,
  p_limit int default 24,
  p_offset int default 0
)
returns table (
  id uuid,
  title text,
  description text,
  category public.need_category,
  urgency public.need_urgency,
  status public.need_status,
  fulfillment public.fulfillment_method,
  photo_path text,
  created_at timestamptz,
  distance_miles double precision,
  poster_id uuid,
  poster_name text,
  poster_avatar text,
  poster_area text,
  total_count bigint
)
language sql stable security invoker set search_path = public
as $$
  with base as (
    select n.*,
      case when p_lat is null or p_lng is null then null
           else public.miles_between(p_lat, p_lng, n.lat, n.lng) end as dist
    from public.needs n
    where n.status in ('open','pledged')
      and (p_category is null or n.category = p_category)
      and (p_urgency is null or n.urgency = p_urgency)
      and (p_query is null or p_query = '' or n.search @@ plainto_tsquery('english', p_query))
  ),
  filtered as (
    select * from base
    where p_radius_miles is null or dist is null or dist <= p_radius_miles
  )
  select f.id, f.title, f.description, f.category, f.urgency, f.status, f.fulfillment, f.photo_path, f.created_at,
         round(f.dist::numeric, 1)::double precision as distance_miles,
         f.poster_id, p.display_name, p.avatar_url, p.area,
         count(*) over () as total_count
  from filtered f
  -- the view, not the table: anonymous visitors can't read profiles directly
  join public.public_profiles p on p.id = f.poster_id
  order by
    (f.status = 'open') desc,
    (f.urgency = 'high') desc,
    f.dist asc nulls last,
    f.created_at desc
  limit greatest(1, least(p_limit, 60))
  offset greatest(0, p_offset);
$$;

-- ---------- admin ----------
create or replace function public.admin_ban_user(p_user_id uuid, p_ban boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Admins only.' using errcode = '42501'; end if;
  if p_ban then
    update public.profiles set banned_at = now() where id = p_user_id;
    update public.needs set status = 'closed', closed_at = now(), helper_id = null, pledged_at = null
      where poster_id = p_user_id and status in ('open','pledged');
    update public.needs set status = 'open', helper_id = null, pledged_at = null
      where helper_id = p_user_id and status = 'pledged';
  else
    update public.profiles set banned_at = null where id = p_user_id;
  end if;
end;
$$;

create or replace function public.admin_remove_need(p_need_id uuid, p_note text default null)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  n public.needs;
begin
  if not public.is_admin() then raise exception 'Admins only.' using errcode = '42501'; end if;
  select * into n from public.needs where id = p_need_id;
  if not found then return; end if;
  delete from public.needs where id = p_need_id;
  insert into public.notifications (user_id, type, title, body, href)
  values (n.poster_id, 'system', 'Your post "' || n.title || '" was removed',
          coalesce(p_note, 'It didn''t follow our guidelines. Reply to this email if you think that''s a mistake.'), '/terms');
end;
$$;

create or replace function public.admin_delete_message(p_message_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Admins only.' using errcode = '42501'; end if;
  update public.messages set body = '[removed by a moderator]' where id = p_message_id;
end;
$$;

-- counts for the landing page and admin
create or replace function public.site_stats()
returns table (open_needs bigint, fulfilled_needs bigint, neighbors bigint)
language sql stable security definer set search_path = public
as $$
  select
    (select count(*) from public.needs where status = 'open'),
    (select count(*) from public.needs where status = 'fulfilled'),
    (select count(*) from public.profiles where banned_at is null);
$$;

-- realtime for messages and notifications
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
