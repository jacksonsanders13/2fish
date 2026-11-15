-- 2fish core app: customers, jobs won, text-back settings, messages, activity events.
-- Applied to the Supabase project on 2026-11-14. Kept here so the schema is in git.

alter table public.businesses
  add column if not exists phone text not null default '',
  add column if not exists city text not null default '',
  add column if not exists timezone text not null default 'America/New_York';

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  last_job_at date,
  last_job_value integer,
  sms_consent boolean not null default false,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);
create index customers_business_idx on public.customers(business_id, created_at desc);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  value integer not null check (value >= 0),
  won_at date not null default current_date,
  source_step text,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index jobs_business_idx on public.jobs(business_id, won_at desc);

create table public.textback_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  forward_number text not null default '',
  template text not null default '',
  hours_start smallint not null default 8,
  hours_end smallint not null default 21,
  delay_seconds smallint not null default 10,
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  phone text not null,
  direction text not null check (direction in ('in','out','missed-call')),
  body text not null default '',
  status text not null default 'logged',
  provider_id text,
  created_at timestamptz not null default now()
);
create index messages_business_idx on public.messages(business_id, phone, created_at);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index events_business_idx on public.events(business_id, created_at desc);

alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.textback_settings enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;

create policy "own customers" on public.customers for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own jobs" on public.jobs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own textback settings" on public.textback_settings for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own messages" on public.messages for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own events" on public.events for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Lets a signed-in owner delete their own account from the app, no service key needed.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
