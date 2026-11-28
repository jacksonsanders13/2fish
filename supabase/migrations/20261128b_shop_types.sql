-- Examples are tagged with the kind of shop they're for, so a plant shop learns
-- from plant shops. "any" works for every shop.
alter table public.post_examples
  add column if not exists store_type text not null default 'any'
  check (store_type in ('boutique', 'gift', 'plants', 'jewelry', 'books', 'any'));
create index if not exists post_examples_type_idx on public.post_examples(store_type) where is_global;

-- Store types now come from a short list of shops. Older rows move onto it.
update public.businesses set kind = 'Clothing boutique' where kind = 'Boutique';
update public.businesses set kind = 'Other shop' where kind not in ('Clothing boutique', 'Gift or home shop', 'Plant or flower shop', 'Jewelry or accessories', 'Bookstore', 'Other shop');
