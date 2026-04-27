-- ============================================================
-- seed.sql — Example data for development and testing
--
-- HOW TO USE:
--   1. Run migrations 000000 and 000001 first.
--   2. Paste this file in Supabase SQL Editor and run it.
--   3. This seed uses fixed UUIDs so it can be run multiple
--      times safely (INSERT ... ON CONFLICT DO NOTHING).
--
-- NOTE: The restaurant here has NO user_id set (null) because
--   there is no real Auth user yet. To test the owner app:
--   a) Create a user in Supabase Auth → Authentication → Users
--   b) Copy their UUID and run:
--      UPDATE public.restaurants
--      SET user_id = '<your-user-uuid>'
--      WHERE id = '00000000-0000-0000-0000-000000000001';
-- ============================================================

-- ============================================================
-- Restaurant
-- ============================================================
insert into public.restaurants (id, user_id, name, slug, description, is_active)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000', -- placeholder, update with real user_id
  'Bar de Prueba',
  'bar-test',
  'El mejor bar del barrio. Tapas caseras y buena música.',
  true
)
on conflict (id) do nothing;

-- ============================================================
-- Categories
-- ============================================================
insert into public.categories (id, restaurant_id, name, description, sort_order, is_active)
values
  (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Tapas',
    'Nuestras tapas más populares',
    1,
    true
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Bebidas',
    'Refrescos, cervezas y cócteles',
    2,
    true
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Postres',
    'Para terminar con dulzura',
    3,
    true
  )
on conflict (id) do nothing;

-- ============================================================
-- Products
-- ============================================================
insert into public.products (id, category_id, restaurant_id, name, description, price, is_active, sort_order)
values
  -- Tapas
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Patatas Bravas',
    'Patatas fritas con salsa brava y alioli',
    3.50,
    true,
    1
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Croquetas de Jamón',
    'Croquetas caseras de jamón ibérico (6 uds)',
    4.50,
    true,
    2
  ),
  -- Bebidas
  (
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Caña de Cerveza',
    'Cerveza rubia de barril bien fría',
    1.80,
    true,
    1
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Agua Mineral',
    'Botella 50cl con o sin gas',
    1.20,
    true,
    2
  ),
  -- Postres
  (
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Crema Catalana',
    'Receta tradicional con azúcar caramelizado',
    3.00,
    true,
    1
  ),
  (
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Coulant de Chocolate',
    'Bizcocho caliente con interior fundido, bola de vainilla',
    4.00,
    true,
    2
  )
on conflict (id) do nothing;

-- ============================================================
-- Product availability (day restrictions)
--
-- Patatas Bravas (id 001): only available Mon–Fri (1,2,3,4,5)
-- Coulant de Chocolate (id 006): only available Fri–Sun (5,6,0)
-- All other products: no rows = available every day
-- ============================================================
insert into public.product_availability (product_id, day_of_week)
values
  -- Patatas Bravas: Mon–Fri
  ('00000000-0000-0000-0002-000000000001', 1),
  ('00000000-0000-0000-0002-000000000001', 2),
  ('00000000-0000-0000-0002-000000000001', 3),
  ('00000000-0000-0000-0002-000000000001', 4),
  ('00000000-0000-0000-0002-000000000001', 5),
  -- Coulant: Fri, Sat, Sun
  ('00000000-0000-0000-0002-000000000006', 5),
  ('00000000-0000-0000-0002-000000000006', 6),
  ('00000000-0000-0000-0002-000000000006', 0)
on conflict (product_id, day_of_week) do nothing;
