-- ============================================================
-- seed.sql — Datos de demostración: Bar La Pepa
--
-- USO:
--   1. Aplica las migraciones primero.
--   2. Abre Supabase → SQL Editor → pega y ejecuta.
--   3. El script detecta automáticamente tu usuario por email.
--      Cambia el email si es necesario.
--   4. Es idempotente: si ya existe el restaurante, borra sus
--      categorías y productos y los vuelve a crear desde cero.
-- ============================================================

do $$
declare
  v_user_id     uuid;
  v_restaurant  uuid;
  c_entrantes   uuid;
  c_tapas       uuid;
  c_raciones    uuid;
  c_bocadillos  uuid;
  c_bebidas     uuid;
  c_postres     uuid;
begin

  -- ── 1. Usuario ────────────────────────────────────────────
  select id into v_user_id
  from auth.users
  where email = 'dvm3manantial@gmail.com'   -- ← tu email de Supabase Auth
  limit 1;

  if v_user_id is null then
    raise exception
      'Usuario no encontrado. Comprueba el email o créalo en Authentication → Users.';
  end if;

  -- ── 2. Restaurante ────────────────────────────────────────
  select id into v_restaurant
  from public.restaurants
  where user_id = v_user_id
  limit 1;

  if v_restaurant is null then
    insert into public.restaurants
      (user_id, name, slug, description, is_active)
    values (
      v_user_id,
      'Bar La Pepa',
      'bar-la-pepa',
      'Tapas tradicionales en el corazón del barrio desde 1987.',
      true
    )
    returning id into v_restaurant;

    raise notice 'Restaurante creado: %', v_restaurant;
  else
    raise notice 'Restaurante existente reutilizado: %', v_restaurant;
  end if;

  -- Limpieza idempotente (cascade borra productos y disponibilidades)
  delete from public.categories where restaurant_id = v_restaurant;

  -- ── 3. Categorías ─────────────────────────────────────────
  insert into public.categories (restaurant_id, name, description, sort_order, is_active)
  values
    (v_restaurant, 'Entrantes',  'Para abrir boca',                0, true),
    (v_restaurant, 'Tapas',      'Las clásicas de toda la vida',   1, true),
    (v_restaurant, 'Raciones',   'Para compartir entre todos',     2, true),
    (v_restaurant, 'Bocadillos', 'Pan de pueblo recién hecho',     3, true),
    (v_restaurant, 'Bebidas',    'Frescas y del tiempo',           4, true),
    (v_restaurant, 'Postres',    'El dulce final',                 5, true);

  select id into c_entrantes  from public.categories where restaurant_id = v_restaurant and name = 'Entrantes';
  select id into c_tapas      from public.categories where restaurant_id = v_restaurant and name = 'Tapas';
  select id into c_raciones   from public.categories where restaurant_id = v_restaurant and name = 'Raciones';
  select id into c_bocadillos from public.categories where restaurant_id = v_restaurant and name = 'Bocadillos';
  select id into c_bebidas    from public.categories where restaurant_id = v_restaurant and name = 'Bebidas';
  select id into c_postres    from public.categories where restaurant_id = v_restaurant and name = 'Postres';

  -- ── 4. Productos ──────────────────────────────────────────
  insert into public.products
    (restaurant_id, category_id, name, description, price, sort_order, is_active)
  values

    -- Entrantes
    (v_restaurant, c_entrantes, 'Pan con tomate',
     'Pan de cristal tostado con tomate natural y aceite de oliva virgen extra.',
     2.50, 0, true),

    (v_restaurant, c_entrantes, 'Croquetas caseras (6 ud)',
     'Croquetas de jamón ibérico con bechamel cremosa. Receta de la abuela.',
     6.50, 1, true),

    (v_restaurant, c_entrantes, 'Boquerones en vinagre',
     'Marinados en vinagre de jerez, ajo y perejil frescos.',
     4.50, 2, true),

    (v_restaurant, c_entrantes, 'Anchoas del Cantábrico',
     'Anchoas 00 sobre pan con mantequilla y un toque de limón.',
     7.00, 3, true),

    -- Tapas
    (v_restaurant, c_tapas, 'Patatas bravas',
     'Patatas fritas con salsa brava picante y alioli casero.',
     3.50, 0, true),

    (v_restaurant, c_tapas, 'Tortilla española',
     'Tortilla de patata con cebolla, jugosa por dentro.',
     3.00, 1, true),

    (v_restaurant, c_tapas, 'Gambas al ajillo',
     'Gambas salteadas en aceite con ajo laminado y guindilla.',
     5.50, 2, true),

    (v_restaurant, c_tapas, 'Pimientos de Padrón',
     'Fritos en aceite con sal en escama. Unos pican y otros no.',
     4.00, 3, true),

    (v_restaurant, c_tapas, 'Pulpo a la gallega',
     'Pulpo cocido sobre cachelos, pimentón de La Vera y aceite.',
     6.00, 4, true),

    (v_restaurant, c_tapas, 'Mejillones al vapor',
     'Mejillones gallegos al vapor con limón. Por docena.',
     5.00, 5, true),

    -- Raciones
    (v_restaurant, c_raciones, 'Jamón ibérico de bellota',
     'Cortado a mano, D.O. Guijuelo. Con pan con tomate.',
     16.00, 0, true),

    (v_restaurant, c_raciones, 'Tabla de quesos',
     'Manchego curado, cabrales y tetilla con membrillo y nueces.',
     12.00, 1, true),

    (v_restaurant, c_raciones, 'Cazón en adobo',
     'Cazón marinado en adobo tradicional, frito. Con limón.',
     9.50, 2, true),

    (v_restaurant, c_raciones, 'Calamares a la romana',
     'Calamares frescos rebozados con masa ligera y alioli.',
     10.00, 3, true),

    (v_restaurant, c_raciones, 'Oreja a la plancha',
     'Oreja de cerdo a la plancha con pimentón y sal gorda.',
     7.50, 4, true),

    -- Bocadillos
    (v_restaurant, c_bocadillos, 'Bocadillo de calamares',
     'Calamares fritos en pan de barra crujiente con alioli.',
     5.50, 0, true),

    (v_restaurant, c_bocadillos, 'Bocadillo de jamón serrano',
     'Jamón serrano con tomate y aceite en pan de pueblo.',
     4.50, 1, true),

    (v_restaurant, c_bocadillos, 'Bocadillo de tortilla',
     'Tortilla española jugosa en pan de barra. Con o sin cebolla.',
     4.00, 2, true),

    (v_restaurant, c_bocadillos, 'Montado de lomo',
     'Lomo de cerdo a la plancha con pimientos rojos asados.',
     4.50, 3, true),

    -- Bebidas
    (v_restaurant, c_bebidas, 'Caña de cerveza',
     'Cerveza de barril bien fría.',
     2.00, 0, true),

    (v_restaurant, c_bebidas, 'Botella de cerveza',
     'Tercio de cerveza rubia. Pregunta por las marcas disponibles.',
     2.50, 1, true),

    (v_restaurant, c_bebidas, 'Vino de la casa',
     'Tinto, blanco o rosado de la comarca. Copa o botella.',
     2.00, 2, true),

    (v_restaurant, c_bebidas, 'Vermut',
     'Vermut rojo con naranja y aceituna. El aperitivo de siempre.',
     2.50, 3, true),

    (v_restaurant, c_bebidas, 'Agua mineral',
     'Con o sin gas. Botella 50 cl.',
     1.50, 4, true),

    (v_restaurant, c_bebidas, 'Refresco',
     'Coca-Cola, Fanta naranja, Fanta limón o Nestea.',
     2.50, 5, true),

    (v_restaurant, c_bebidas, 'Café solo',
     'Café de tueste natural en cafetera espresso.',
     1.50, 6, true),

    (v_restaurant, c_bebidas, 'Café con leche',
     'Café solo con leche entera caliente al gusto.',
     1.80, 7, true),

    -- Postres
    (v_restaurant, c_postres, 'Flan de huevo casero',
     'Flan de huevo con caramelo líquido. Receta tradicional.',
     3.50, 0, true),

    (v_restaurant, c_postres, 'Tarta de queso',
     'Tarta de queso al horno estilo La Viña, con coulis de frutos rojos.',
     4.50, 1, true),

    (v_restaurant, c_postres, 'Arroz con leche',
     'Templado y espolvoreado con canela. De la abuela.',
     3.50, 2, true),

    (v_restaurant, c_postres, 'Helado artesano',
     'Dos bolas: vainilla, chocolate, fresa o turrón.',
     3.00, 3, true),

    (v_restaurant, c_postres, 'Coulant de chocolate',
     'Bizcocho caliente con interior fundido. Con bola de vainilla.',
     4.50, 4, true);

  -- ── 5. Disponibilidad especial ────────────────────────────
  -- Coulant: solo viernes, sábado y domingo (5, 6, 0)
  insert into public.product_availability (product_id, day_of_week)
  select p.id, d.day
  from public.products p
  cross join (values (5), (6), (0)) as d(day)
  where p.restaurant_id = v_restaurant
    and p.name = 'Coulant de chocolate'
  on conflict (product_id, day_of_week) do nothing;

  raise notice '✅ Seed completado — 6 categorías, 32 productos.';

end $$;
