-- Ron3D Step 2: products table, storage bucket, and RLS policies
-- Run this entire script in the Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- Products table
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price numeric not null check (price >= 0),
  image_url text not null default '',
  model_url text not null default '',
  shopier_url text not null default '',
  is_customizable boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Anyone can read products" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Anyone can read products"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete products"
  on public.products
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket: product-assets (public read)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-assets',
  'product-assets',
  true,
  52428800, -- 50 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'model/gltf-binary',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop existing storage policies if re-running
drop policy if exists "Anyone can read product assets" on storage.objects;
drop policy if exists "Authenticated users can upload product assets" on storage.objects;
drop policy if exists "Authenticated users can update product assets" on storage.objects;
drop policy if exists "Authenticated users can delete product assets" on storage.objects;

create policy "Anyone can read product assets"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-assets');

create policy "Authenticated users can upload product assets"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-assets');

create policy "Authenticated users can update product assets"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-assets')
  with check (bucket_id = 'product-assets');

create policy "Authenticated users can delete product assets"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-assets');
