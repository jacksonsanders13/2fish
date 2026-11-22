-- Square connection: the agent reads the store's sales itself, so nobody types numbers in.

-- Tokens live here. RLS is on with no policies, so only the server (secret key) can read them.
create table public.square_connections (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  merchant_id text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  connected_at timestamptz not null default now(),
  last_error text
);
alter table public.square_connections enable row level security;

-- What the owner's app can see about the connection.
alter table public.businesses
  add column if not exists square_connected_at timestamptz,
  add column if not exists square_synced_at timestamptz;

-- Sales by day and by item, written by the sync. Owners can read their own.
create table public.sales_daily (
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  total integer not null default 0,
  orders integer not null default 0,
  primary key (business_id, day)
);

create table public.item_daily (
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  item text not null,
  qty numeric not null default 0,
  amount integer not null default 0,
  primary key (business_id, day, item)
);
create index item_daily_day_idx on public.item_daily(business_id, day desc);

alter table public.sales_daily enable row level security;
alter table public.item_daily enable row level security;
create policy "read own daily sales" on public.sales_daily for select using (owner_id = (select auth.uid()));
create policy "read own item sales" on public.item_daily for select using (owner_id = (select auth.uid()));
