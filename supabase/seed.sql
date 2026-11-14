-- Demo data for LOCAL DEVELOPMENT ONLY. Never run this against production.
-- Creates four neighbors (password for all: "password123") and a handful of needs around Raleigh.
-- Run it in the Supabase SQL editor after the migrations, or with: npx supabase db query -f supabase/seed.sql

do $$
declare
  jess uuid := '11111111-1111-4111-8111-111111111111';
  marcus uuid := '22222222-2222-4222-8222-222222222222';
  ana uuid := '33333333-3333-4333-8333-333333333333';
  dee uuid := '44444444-4444-4444-8444-444444444444';
  pw text := crypt('password123', gen_salt('bf'));
  u uuid;
  nm text;
  em text;
begin
  for u, nm, em in
    select * from (values
      (jess, 'Jess', 'jess@example.com'),
      (marcus, 'Marcus', 'marcus@example.com'),
      (ana, 'Ana', 'ana@example.com'),
      (dee, 'Dee', 'dee@example.com')
    ) as t(id, name, email)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', u, 'authenticated', 'authenticated', em, pw, now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', nm, 'terms_accepted', 'true'),
      now(), now(), '', ''
    ) on conflict (id) do nothing;

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u, u::text, 'email', jsonb_build_object('sub', u::text, 'email', em), now(), now(), now())
    on conflict do nothing;
  end loop;

  -- the profile trigger already created rows; fill in location (rounded ZIP centers)
  update public.profiles set zip = '27615', lat = 35.9, lng = -78.64, area = 'North Raleigh', onboarded_at = now(), terms_accepted_at = now() where id = jess;
  update public.profiles set zip = '27609', lat = 35.85, lng = -78.63, area = 'Midtown', onboarded_at = now(), terms_accepted_at = now() where id = marcus;
  update public.profiles set zip = '27617', lat = 35.9, lng = -78.75, area = 'Brier Creek', onboarded_at = now(), terms_accepted_at = now() where id = ana;
  update public.profiles set zip = '27529', lat = 35.68, lng = -78.56, area = 'Garner', onboarded_at = now(), terms_accepted_at = now() where id = dee;

  insert into public.needs (poster_id, title, description, category, urgency, fulfillment, wishlist_url, zip, lat, lng, created_at) values
    (jess, 'Size 4 diapers for twins', 'Any brand is fine. Two boxes would carry us to the end of the month. I can meet at the North Regional Library.', 'baby', 'high', 'both', 'https://www.amazon.com/hz/wishlist/ls/EXAMPLE1', '27615', 35.9, -78.64, now() - interval '2 hours'),
    (marcus, 'Boys'' winter coat, size 10/12', 'He outgrew last year''s coat. Gently used is perfect. Happy to meet at a grocery store on Six Forks.', 'clothing', 'normal', 'in_person', null, '27609', 35.85, -78.63, now() - interval '1 day'),
    (dee, 'Groceries for the week', 'Between paychecks. Rice, beans, peanut butter, anything shelf-stable. Can meet at the Food Lion on Timber Dr.', 'food', 'normal', 'in_person', null, '27529', 35.68, -78.56, now() - interval '50 minutes'),
    (ana, '3rd grade school supplies', 'Pencils, glue sticks, a backpack if anyone has a spare. The list is on the wishlist.', 'school', 'low', 'wishlist', 'https://www.amazon.com/hz/wishlist/ls/EXAMPLE2', '27617', 35.9, -78.75, now() - interval '4 days'),
    (jess, 'Twin bed sheets', 'Moving the kids into their own beds. Two twin sets, any color.', 'household', 'low', 'both', 'https://www.target.com/gift-registry/EXAMPLE', '27615', 35.9, -78.64, now() - interval '3 days'),
    (marcus, 'Shower chair for my dad', 'He''s home from the hospital and needs a shower chair. Used is totally fine.', 'medical', 'high', 'in_person', null, '27609', 35.85, -78.63, now() - interval '6 hours');
end $$;
