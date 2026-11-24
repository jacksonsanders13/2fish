-- Chat history: each conversation gets a name (its first message) and the time
-- it was last used, so owners can start new chats and come back to old ones.
alter table public.conversations add column if not exists title text not null default '' check (length(title) <= 80);
alter table public.conversations add column if not exists updated_at timestamptz not null default now();
update public.conversations c set updated_at = coalesce((select max(m.created_at) from public.chat_messages m where m.conversation_id = c.id), c.created_at);
update public.conversations c set title = coalesce((select left(m.content, 60) from public.chat_messages m where m.conversation_id = c.id and m.role = 'user' order by m.created_at limit 1), '') where title = '';
create index if not exists conversations_recent_idx on public.conversations(business_id, updated_at desc);
