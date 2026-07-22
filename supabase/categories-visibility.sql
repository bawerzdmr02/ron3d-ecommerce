-- Ron3D: category visibility + admin delete
-- Supabase SQL Editor'de çalıştırın (MCP yoksa).

alter table public.categories
  add column if not exists is_visible boolean not null default true;

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete to authenticated
  using (public.is_admin());

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
