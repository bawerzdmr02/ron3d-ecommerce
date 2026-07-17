-- Ron3D: product_reviews — TAM KURULUM (eski user_email şemasını da düzeltir)
-- Supabase SQL Editor'de bu dosyanın TAMAMINI tek seferde çalıştırın.
-- UYARI: Mevcut yorumlar silinir (geliştirme ortamı için uygundur).

-- 1) Eski politikaları ve tabloyu kaldır
drop policy if exists "Anyone can read product reviews" on public.product_reviews;
drop policy if exists "Authenticated users can insert product reviews" on public.product_reviews;

drop table if exists public.product_reviews cascade;

-- 2) Yeni tablo (user_id + ürün başına tek yorum)
create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  constraint product_reviews_product_user_unique unique (product_id, user_id)
);

create index product_reviews_product_id_idx on public.product_reviews (product_id);
create index product_reviews_user_id_idx on public.product_reviews (user_id);
create index product_reviews_created_at_idx on public.product_reviews (created_at desc);

alter table public.product_reviews enable row level security;

-- 3) RLS politikaları
create policy "Anyone can read product reviews"
  on public.product_reviews
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert product reviews"
  on public.product_reviews
  for insert
  to authenticated
  with check (auth.uid() = user_id);
