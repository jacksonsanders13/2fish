-- Chat gets a monthly cap by plan, on top of the daily one, so one heavy user
-- can't cost more than the plan brings in. Solo ($20 or no plan yet) 30 a month,
-- Growing ($50) 100, Established ($75 and up) 200. The daily caps stay as they were.
create or replace function public.use_quota(p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  cap integer;
  price integer;
  monthly integer;
  used integer;
begin
  if auth.uid() is null then
    return false;
  end if;
  cap := case p_kind when 'chat' then 50 when 'text' then 30 when 'pack' then 5 when 'skill' then 20 else 0 end;
  if cap = 0 then
    return false;
  end if;

  if p_kind = 'chat' then
    select plan_price into price from public.businesses
      where owner_id = auth.uid() order by created_at limit 1;
    monthly := case when coalesce(price, 0) >= 75 then 200 when coalesce(price, 0) >= 50 then 100 else 30 end;
    select coalesce(sum(count), 0) into used from public.usage_daily
      where owner_id = auth.uid() and kind = 'chat' and day >= date_trunc('month', current_date)::date;
    -- Over the month's cap: say no without counting the try.
    if used >= monthly then
      return false;
    end if;
  end if;

  insert into public.usage_daily (owner_id, day, kind, count)
  values (auth.uid(), current_date, p_kind, 1)
  on conflict (owner_id, day, kind) do update set count = public.usage_daily.count + 1
  returning count into n;
  return n <= cap;
end;
$$;
