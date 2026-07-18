-- Ron3D: product_reviews is_approved (yorum onay sistemi)
-- Supabase SQL Editor'de çalıştırın.

alter table public.product_reviews
  add column if not exists is_approved boolean not null default false;

create index if not exists product_reviews_is_approved_idx
  on public.product_reviews (is_approved);

drop policy if exists "Anyone can read product reviews" on public.product_reviews;
drop policy if exists "Public can read approved reviews" on public.product_reviews;
drop policy if exists "Authenticated can read all reviews" on public.product_reviews;
drop policy if exists "Authenticated users can update product reviews" on public.product_reviews;
drop policy if exists "Authenticated users can delete product reviews" on public.product_reviews;

create policy "Public can read approved reviews"
  on public.product_reviews
  for select
  to anon
  using (is_approved = true);

create policy "Authenticated can read all reviews"
  on public.product_reviews
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update product reviews"
  on public.product_reviews
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete product reviews"
  on public.product_reviews
  for delete
  to authenticated
  using (true);
