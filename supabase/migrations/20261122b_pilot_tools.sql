-- Pilot tools: the weekly pack of posts, the checkout tap, weekly sales and
-- featured-item counts. No promo codes: proof comes from how shoppers say they
-- heard about the store, what the posted items sold, and sales vs. before 2fish.

alter table public.businesses
  add column if not exists plan_price integer check (plan_price is null or plan_price >= 0);

-- One row per post. week_of is the Monday the pack is for.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_of date not null,
  position smallint not null check (position between 1 and 7),
  day text not null default '',
  kind text not null default 'other',
  title text not null default '',
  hook text not null default '',
  caption text not null default '',
  items text[] not null default '{}',
  media_path text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'posted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_week_idx on public.posts(business_id, week_of desc, position);

-- The checkout tap: how this shopper heard about the store, and what they spent.
create table public.checkouts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('post', 'google', 'walked-by', 'friend', 'regular', 'other')),
  amount integer not null check (amount >= 0 and amount <= 100000),
  post_id uuid references public.posts(id) on delete set null,
  sold_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index checkouts_business_idx on public.checkouts(business_id, sold_on desc);

-- The one number the owner types in each week. Weeks before the first pack are the baseline.
create table public.weekly_sales (
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_of date not null,
  amount integer not null check (amount >= 0 and amount <= 10000000),
  updated_at timestamptz not null default now(),
  primary key (business_id, week_of)
);

-- How many of each featured item sold that week, and the week before.
create table public.item_sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_of date not null,
  item text not null check (length(item) between 1 and 120),
  sold integer not null default 0 check (sold >= 0 and sold <= 100000),
  sold_before integer not null default 0 check (sold_before >= 0 and sold_before <= 100000),
  unique (business_id, week_of, item)
);

alter table public.posts enable row level security;
alter table public.checkouts enable row level security;
alter table public.weekly_sales enable row level security;
alter table public.item_sales enable row level security;

create policy "own posts" on public.posts for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "own checkouts" on public.checkouts for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "own weekly sales" on public.weekly_sales for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "own item sales" on public.item_sales for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- Making a pack calls Claude with photos, so it gets its own daily cap: 5.
alter table public.usage_daily drop constraint if exists usage_daily_kind_check;
alter table public.usage_daily add constraint usage_daily_kind_check check (kind in ('chat', 'text', 'pack'));

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
  cap := case p_kind when 'chat' then 50 when 'text' then 30 when 'pack' then 5 else 0 end;
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
