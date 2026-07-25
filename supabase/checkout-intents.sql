-- Ron3D: checkout intents (Shopier ödeme öncesi user/product eşlemesi)
-- Supabase SQL Editor'de çalıştırın.

create table if not exists public.checkout_intents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  custom_text text,
  consumed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '2 hours'),
  created_at timestamptz not null default now()
);

create index if not exists checkout_intents_code_idx
  on public.checkout_intents (code);

create index if not exists checkout_intents_user_open_idx
  on public.checkout_intents (user_id, created_at desc)
  where consumed_at is null;

alter table public.checkout_intents enable row level security;

drop policy if exists "Users insert own checkout intents" on public.checkout_intents;
drop policy if exists "Users read own checkout intents" on public.checkout_intents;

create policy "Users insert own checkout intents"
  on public.checkout_intents
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users read own checkout intents"
  on public.checkout_intents
  for select
  to authenticated
  using (user_id = auth.uid());
