-- Post examples: popular posts the agent studies before it writes a week of
-- posts. Owners add their own. Examples marked global (added by 2fish's own
-- admin account, through the server) are read by every store.

create table public.post_examples (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  is_global boolean not null default false,
  kind text not null default 'other',
  hook text not null default '' check (length(hook) <= 300),
  caption text not null default '' check (length(caption) <= 2200),
  why text not null default '' check (length(why) <= 500),
  views integer check (views is null or views >= 0),
  likes integer check (likes is null or likes >= 0),
  link text not null default '' check (length(link) <= 500),
  created_at timestamptz not null default now()
);
create index post_examples_owner_idx on public.post_examples(owner_id, created_at desc);
create index post_examples_global_idx on public.post_examples(is_global) where is_global;

alter table public.post_examples enable row level security;
create policy "read own or global examples" on public.post_examples for select
  using (is_global or owner_id = (select auth.uid()));
create policy "add own examples" on public.post_examples for insert
  with check (owner_id = (select auth.uid()) and not is_global);
create policy "delete own examples" on public.post_examples for delete
  using (owner_id = (select auth.uid()));
