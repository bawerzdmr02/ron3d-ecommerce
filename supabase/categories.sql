-- Ron3D: category showcase cards (admin-editable images)
-- Supabase SQL Editor'de bu dosyanın tamamını çalıştırın.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  image_url text not null default '',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists categories_sort_order_idx
  on public.categories (sort_order asc, name asc);

alter table public.categories enable row level security;

drop policy if exists "Anyone can read categories" on public.categories;
drop policy if exists "Authenticated can upsert categories" on public.categories;
drop policy if exists "Authenticated can update categories" on public.categories;
drop policy if exists "Authenticated can insert categories" on public.categories;

create policy "Anyone can read categories"
  on public.categories
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated can insert categories"
  on public.categories
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update categories"
  on public.categories
  for update
  to authenticated
  using (true)
  with check (true);

-- Seed fixed storefront categories (images empty until admin uploads)
insert into public.categories (name, slug, sort_order) values
  ('Anahtarlık', 'anahtarlik', 1),
  ('Oyuncak & Figür', 'oyuncak-figur', 2),
  ('Motor & Araç Aksesuarı', 'motor-arac-aksesuari', 3),
  ('3D Lithophane', '3d-lithophane', 4),
  ('Dekoratif & Ev', 'dekoratif-ev', 5),
  ('Yedek Parça & Tamir', 'yedek-parca-tamir', 6),
  ('Kutu & Organizatör', 'kutu-organizator', 7),
  ('Maket & Minyatür', 'maket-minyatur', 8),
  ('Kişiye Özel', 'kisiye-ozel', 9),
  ('Diğer', 'diger', 10)
on conflict (slug) do nothing;
