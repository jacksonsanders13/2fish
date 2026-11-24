-- The post calendar: each post gets the date it goes up (the owner can move it)
-- and, when it belongs to one, the name of the campaign it's part of.
alter table public.posts add column if not exists post_on date;
alter table public.posts add column if not exists campaign text not null default '' check (length(campaign) <= 80);

-- Fill in dates for posts that already exist: the pack's Monday plus the post's slot.
update public.posts set post_on = week_of + (position - 1) where post_on is null;

create index if not exists posts_post_on_idx on public.posts(business_id, post_on);
