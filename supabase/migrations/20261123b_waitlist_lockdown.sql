-- Belt and braces: the public can only add to the waitlist. No reading,
-- changing, deleting or emptying it, even if the row rules were ever loosened.
revoke all on public.waitlist from anon, authenticated;
grant insert on public.waitlist to anon, authenticated;