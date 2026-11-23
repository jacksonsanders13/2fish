-- The waitlist while 2fish is in waitlist mode. Anyone can add themselves;
-- nobody can read the list through the API (only the dashboard or the server key).
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) between 3 and 200 and email like '%@%'),
  store text not null default '' check (length(store) <= 120),
  plan text not null default '' check (plan in ('', 'starter', 'growth', 'pro', 'not sure')),
  source text not null default '' check (length(source) <= 200),
  created_at timestamptz not null default now()
);
create unique index waitlist_email_idx on public.waitlist (lower(email));

alter table public.waitlist enable row level security;
create policy "anyone can join the waitlist" on public.waitlist for insert to anon, authenticated with check (true);