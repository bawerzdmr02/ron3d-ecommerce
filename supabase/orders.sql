-- Ron3D: orders table (future-ready for Shopier webhook integration)

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null default '',
  amount numeric not null default 0 check (amount >= 0),
  status text not null default 'beklemede',
  created_at timestamptz not null default now()
);

create index if not exists orders_user_email_idx on public.orders (user_email);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Users can read own orders" on public.orders;

create policy "Users can read own orders"
  on public.orders
  for select
  to authenticated
  using (user_email = (auth.jwt() ->> 'email'));
