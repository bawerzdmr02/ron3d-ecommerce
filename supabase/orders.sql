-- Ron3D: orders table (Shopier webhook için hazır altyapı)
-- Supabase SQL Editor'de bu dosyanın TAMAMINI tek seferde çalıştırın.
-- Tablo yokken DROP POLICY hata verir; bu yüzden doğrudan DROP TABLE kullanılır.

drop table if exists public.orders cascade;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  custom_text text,
  status text not null default 'Hazırlanıyor'
    check (status in ('Bekliyor', 'Hazırlanıyor', 'Kargoya Verildi', 'İptal')),
  price numeric not null default 0 check (price >= 0),
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Authenticated can read all orders"
  on public.orders
  for select
  to authenticated
  using (true);

create policy "Authenticated can update orders"
  on public.orders
  for update
  to authenticated
  using (true)
  with check (true);
