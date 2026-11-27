-- Instagram auto-posting. The owner connects their Instagram business account
-- once, and every approved post goes up by itself on its day.

-- Tokens live here. RLS is on with no policies, so only the server (secret key) can read them.
create table if not exists public.instagram_connections (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  ig_user_id text not null,
  username text,
  access_token text not null,
  expires_at timestamptz not null,
  connected_at timestamptz not null default now(),
  last_error text
);
alter table public.instagram_connections enable row level security;
create index if not exists instagram_connections_owner_idx on public.instagram_connections(owner_id);

-- What the owner's app can see about the connection.
alter table public.businesses
  add column if not exists instagram_username text,
  add column if not exists instagram_connected_at timestamptz;

-- What happened when we tried to post it.
alter table public.posts
  add column if not exists published_at timestamptz,
  add column if not exists ig_media_id text,
  add column if not exists publish_error text;
