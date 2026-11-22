-- The day each store's week of posts gets written. 0 = Sunday ... 6 = Saturday. Monday by default.
alter table public.businesses
  add column if not exists pack_day smallint not null default 1 check (pack_day between 0 and 6);
