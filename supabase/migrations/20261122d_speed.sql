-- Speed: RLS checks call auth.uid() once per query instead of once per row,
-- and owner_id gets an index everywhere RLS filters on it. Same rules, just faster.

alter policy "own agent tasks" on public.agent_tasks using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own audits" on public.audits using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own businesses" on public.businesses using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own chat messages" on public.chat_messages using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own conversations" on public.conversations using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own customers" on public.customers using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own events" on public.events using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own jobs" on public.jobs using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own messages" on public.messages using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own plan steps" on public.plan_steps using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own plans" on public.plans using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "own textback settings" on public.textback_settings using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
alter policy "read own usage" on public.usage_daily using (owner_id = (select auth.uid()));

create index if not exists agent_tasks_owner_idx on public.agent_tasks(owner_id);
create index if not exists chat_messages_owner_idx on public.chat_messages(owner_id);
create index if not exists checkouts_owner_idx on public.checkouts(owner_id);
create index if not exists conversations_owner_idx on public.conversations(owner_id);
create index if not exists customers_owner_idx on public.customers(owner_id);
create index if not exists events_owner_idx on public.events(owner_id);
create index if not exists item_daily_owner_idx on public.item_daily(owner_id);
create index if not exists item_sales_owner_idx on public.item_sales(owner_id);
create index if not exists jobs_owner_idx on public.jobs(owner_id);
create index if not exists messages_owner_idx on public.messages(owner_id);
create index if not exists plan_steps_owner_idx on public.plan_steps(owner_id);
create index if not exists posts_owner_idx on public.posts(owner_id);
create index if not exists sales_daily_owner_idx on public.sales_daily(owner_id);
create index if not exists square_connections_owner_idx on public.square_connections(owner_id);
create index if not exists textback_settings_owner_idx on public.textback_settings(owner_id);
create index if not exists weekly_sales_owner_idx on public.weekly_sales(owner_id);
create index if not exists checkouts_post_idx on public.checkouts(post_id);
create index if not exists audits_business_idx on public.audits(business_id);
create index if not exists plans_business_idx on public.plans(business_id);
create index if not exists plans_audit_idx on public.plans(audit_id);
