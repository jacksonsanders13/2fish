-- Row Level Security. Every table has it on. Default is deny; each policy below opens one door.

alter table public.profiles enable row level security;
alter table public.needs enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.thread_reads enable row level security;
alter table public.notifications enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- ---------- profiles ----------
-- You can read your own full row. Everyone else reads public_profiles (the view).
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- role and banned_at can only be changed by admin functions / service role
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, area, bio, zip, lat, lng, email_notifications, terms_accepted_at, onboarded_at)
  on public.profiles to authenticated;

grant select on public.public_profiles to anon, authenticated;

-- ---------- needs ----------
-- Open and pledged needs are public. Fulfilled/closed are only visible to the people involved.
-- Needs from banned users and from people you've blocked (or who blocked you) are hidden.
create policy "needs: read" on public.needs
  for select to anon, authenticated using (
    (
      status in ('open','pledged')
      and not public.is_banned(poster_id)
      and (auth.uid() is null or not public.blocked_either_way(auth.uid(), poster_id))
    )
    or poster_id = auth.uid()
    or helper_id = auth.uid()
    or public.is_admin()
  );

create policy "needs: insert own" on public.needs
  for insert to authenticated with check (
    poster_id = auth.uid()
    and status = 'open'
    and helper_id is null
  );

create policy "needs: update own" on public.needs
  for update to authenticated using (poster_id = auth.uid()) with check (poster_id = auth.uid());

-- status / helper columns change only through the functions in 0001
revoke update on public.needs from authenticated;
grant update (title, description, category, urgency, fulfillment, wishlist_url, photo_path)
  on public.needs to authenticated;

create policy "needs: delete own" on public.needs
  for delete to authenticated using (poster_id = auth.uid() or public.is_admin());

-- ---------- threads ----------
create policy "threads: participants read" on public.threads
  for select to authenticated using (poster_id = auth.uid() or helper_id = auth.uid() or public.is_admin());
-- created only by offer_help()

-- ---------- messages ----------
create policy "messages: participants read" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id and (t.poster_id = auth.uid() or t.helper_id = auth.uid())
    )
    or public.is_admin()
  );
-- inserted only by send_message()

-- ---------- thread reads ----------
create policy "thread_reads: own" on public.thread_reads
  for select to authenticated using (user_id = auth.uid());

-- ---------- notifications ----------
create policy "notifications: read own" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications: update own" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
create policy "notifications: delete own" on public.notifications
  for delete to authenticated using (user_id = auth.uid());

-- ---------- blocks ----------
create policy "blocks: read own" on public.blocks
  for select to authenticated using (blocker_id = auth.uid());
create policy "blocks: insert own" on public.blocks
  for insert to authenticated with check (blocker_id = auth.uid() and blocker_id <> blocked_id);
create policy "blocks: delete own" on public.blocks
  for delete to authenticated using (blocker_id = auth.uid());

-- ---------- reports ----------
create policy "reports: insert own" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy "reports: read own or admin" on public.reports
  for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
create policy "reports: admin update" on public.reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- functions callable by signed-in users
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.nearby_needs to anon, authenticated;
grant execute on function public.site_stats to anon, authenticated;
grant execute on function public.miles_between to anon, authenticated;
-- these run inside the policies above, so every role that reads needs must be able to call them
grant execute on function public.is_admin, public.is_banned, public.blocked_either_way to anon, authenticated;
grant execute on function public.offer_help, public.cancel_offer, public.mark_fulfilled, public.close_need,
  public.reopen_need, public.send_message, public.mark_thread_read, public.block_user to authenticated;
grant execute on function public.admin_ban_user, public.admin_remove_need, public.admin_delete_message to authenticated;
