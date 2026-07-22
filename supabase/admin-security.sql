-- Ron3D: admin-only writes via app_metadata.role = 'admin'
-- Run in Supabase SQL Editor (or applied via migration).

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Products: public read, admin write
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Categories: public read, admin write
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated can insert categories" on public.categories;
drop policy if exists "Authenticated can update categories" on public.categories;
drop policy if exists "Admins can insert categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;

create policy "Admins can insert categories"
  on public.categories for insert to authenticated
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Orders: users read own; admins read/update all
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated can read all orders" on public.orders;
drop policy if exists "Authenticated can update orders" on public.orders;
drop policy if exists "Admins can read all orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;

create policy "Admins can read all orders"
  on public.orders for select to authenticated
  using (public.is_admin());

create policy "Admins can update orders"
  on public.orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Reviews: keep user insert; admin moderate
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated can read all reviews" on public.product_reviews;
drop policy if exists "Authenticated users can update product reviews" on public.product_reviews;
drop policy if exists "Authenticated users can delete product reviews" on public.product_reviews;
drop policy if exists "Admins can read all reviews" on public.product_reviews;
drop policy if exists "Admins can update product reviews" on public.product_reviews;
drop policy if exists "Admins can delete product reviews" on public.product_reviews;

create policy "Admins can read all reviews"
  on public.product_reviews for select to authenticated
  using (public.is_admin());

create policy "Admins can update product reviews"
  on public.product_reviews for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete product reviews"
  on public.product_reviews for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage product-assets: public read, admin write
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can upload product assets" on storage.objects;
drop policy if exists "Authenticated users can update product assets" on storage.objects;
drop policy if exists "Authenticated users can delete product assets" on storage.objects;
drop policy if exists "Admins can upload product assets" on storage.objects;
drop policy if exists "Admins can update product assets" on storage.objects;
drop policy if exists "Admins can delete product assets" on storage.objects;

create policy "Admins can upload product assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-assets' and public.is_admin());

create policy "Admins can update product assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-assets' and public.is_admin())
  with check (bucket_id = 'product-assets' and public.is_admin());

create policy "Admins can delete product assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-assets' and public.is_admin());
