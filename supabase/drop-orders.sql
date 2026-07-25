-- Ron3D: remove site-side order tracking (orders managed in Shopier)
drop table if exists public.checkout_intents cascade;
drop table if exists public.orders cascade;
