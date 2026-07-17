-- Ron3D Step 6: add category column to products
alter table public.products
  add column if not exists category text not null default 'Diğer';

-- Optional: backfill any existing rows (default already handles new column)
update public.products
set category = 'Diğer'
where category is null or category = '';
