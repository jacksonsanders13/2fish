-- The AI consultant: one running conversation per business, the work it queues
-- up (tasks), and per-step settings it can adjust (like videos per week).
-- Applied to the Supabase project on 2026-11-15.
alter table public.plan_steps add column if not exists settings jsonb not null default '{}'::jsonb;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index conversations_business_idx on public.conversations(business_id, created_at desc);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index chat_messages_conversation_idx on public.chat_messages(conversation_id, created_at);

create table public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  status text not null default 'queued'
    check (status in ('waiting_on_owner','queued','running','done','failed','dismissed')),
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index agent_tasks_business_idx on public.agent_tasks(business_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.agent_tasks enable row level security;
create policy "own conversations" on public.conversations for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own chat messages" on public.chat_messages for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own agent tasks" on public.agent_tasks for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Private bucket for the owner's phone clips. Each owner can only touch their own folder.
insert into storage.buckets (id, name, public) values ('clips', 'clips', false) on conflict (id) do nothing;
create policy "owners read own clips" on storage.objects for select to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners upload own clips" on storage.objects for insert to authenticated
  with check (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owners delete own clips" on storage.objects for delete to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
