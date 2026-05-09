-- ============================================
-- TAVERO - Full Schema Reset
-- Run in Supabase SQL Editor (one shot)
-- ============================================

-- 1. Drop everything (cascade drops policies, triggers, indexes automatically)
drop table if exists menu_schedules cascade;
drop table if exists restaurant_banners cascade;
drop table if exists menu_visits cascade;
drop table if exists product_variants cascade;
drop table if exists product_labels cascade;
drop table if exists product_allergens cascade;
drop table if exists product_availability cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists menus cascade;
drop table if exists restaurants cascade;
drop table if exists allergens cascade;

drop function if exists update_updated_at cascade;

-- ============================================
-- 2. Tables
-- ============================================

-- Restaurants
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  menu_banner_url text,
  menu_font text,
  menu_accent_color text,
  is_active boolean not null default true,
  phone text,
  address text,
  latitude double precision,
  longitude double precision,
  wifi_name text,
  wifi_password text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  twitter_url text,
  website_url text,
  whatsapp_number text,
  theme_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Menus
create table menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  menu_id uuid references menus(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_active boolean not null default true,
  out_of_stock boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product availability (days of week 0-6)
create table product_availability (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6)
);

-- Allergens
create table allergens (
  id text primary key,
  name text not null,
  icon text not null
);

-- Product allergens
create table product_allergens (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  allergen_id text not null references allergens(id) on delete cascade,
  type text not null default 'contains' check (type in ('contains', 'may_contain'))
);

-- Product labels
create table product_labels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null
);

-- Product variants
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Menu visits
create table menu_visits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  visited_at timestamptz not null default now(),
  user_agent text,
  referer text
);

-- Restaurant banners
create table restaurant_banners (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  text text not null,
  link_url text,
  bg_color text not null default '#1C1917',
  text_color text not null default '#FFFFFF',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- Menu schedules (day_of_week 0=Sun…6=Sat)
create table menu_schedules (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menus(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null
);

-- ============================================
-- 3. Indexes
-- ============================================
create index idx_categories_restaurant on categories(restaurant_id);
create index idx_categories_menu on categories(menu_id);
create index idx_products_category on products(category_id);
create index idx_products_restaurant on products(restaurant_id);
create index idx_products_out_of_stock on products(out_of_stock);
create index idx_menus_restaurant on menus(restaurant_id);
create index idx_product_availability_product on product_availability(product_id);
create index idx_product_allergens_product on product_allergens(product_id);
create index idx_product_labels_product on product_labels(product_id);
create index idx_product_variants_product on product_variants(product_id);
create index idx_menu_visits_restaurant on menu_visits(restaurant_id);
create index idx_menu_visits_visited_at on menu_visits(visited_at);
create index idx_banners_restaurant on restaurant_banners(restaurant_id);
create index idx_schedules_menu on menu_schedules(menu_id);

-- ============================================
-- 4. Triggers (updated_at)
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger restaurants_updated before update on restaurants
  for each row execute function update_updated_at();
create trigger menus_updated before update on menus
  for each row execute function update_updated_at();
create trigger categories_updated before update on categories
  for each row execute function update_updated_at();
create trigger products_updated before update on products
  for each row execute function update_updated_at();

-- ============================================
-- 5. Row Level Security
-- ============================================
alter table restaurants enable row level security;
alter table menus enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_availability enable row level security;
alter table allergens enable row level security;
alter table product_allergens enable row level security;
alter table product_labels enable row level security;
alter table product_variants enable row level security;
alter table menu_visits enable row level security;
alter table restaurant_banners enable row level security;
alter table menu_schedules enable row level security;

-- Allergens: public read
create policy "Allergens public read" on allergens for select using (true);

-- Restaurant owners: manage own data
create policy "Users manage own restaurants" on restaurants
  for all using (auth.uid() = user_id);

create policy "Menus owned by restaurant owner" on menus
  for all using (restaurant_id in (select id from restaurants where user_id = auth.uid()));

create policy "Categories owned by restaurant owner" on categories
  for all using (restaurant_id in (select id from restaurants where user_id = auth.uid()));

create policy "Products owned by restaurant owner" on products
  for all using (restaurant_id in (select id from restaurants where user_id = auth.uid()));

create policy "Product availability owned by restaurant owner" on product_availability
  for all using (product_id in (select id from products where restaurant_id in (select id from restaurants where user_id = auth.uid())));

create policy "Product allergens owned by restaurant owner" on product_allergens
  for all using (product_id in (select id from products where restaurant_id in (select id from restaurants where user_id = auth.uid())));

create policy "Product labels owned by restaurant owner" on product_labels
  for all using (product_id in (select id from products where restaurant_id in (select id from restaurants where user_id = auth.uid())));

create policy "Product variants owned by restaurant owner" on product_variants
  for all using (product_id in (select id from products where restaurant_id in (select id from restaurants where user_id = auth.uid())));

create policy "Menu visits owned by restaurant owner" on menu_visits
  for all using (restaurant_id in (select id from restaurants where user_id = auth.uid()));

create policy "Banners owned by restaurant owner" on restaurant_banners
  for all using (restaurant_id in (select id from restaurants where user_id = auth.uid()));

create policy "Schedules owned by menu owner" on menu_schedules
  for all using (menu_id in (select id from menus where restaurant_id in (select id from restaurants where user_id = auth.uid())));

-- Public read for menu pages
create policy "Public read menus" on menus for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read product availability" on product_availability for select using (true);
create policy "Public read product allergens" on product_allergens for select using (true);
create policy "Public read product labels" on product_labels for select using (true);
create policy "Public read product variants" on product_variants for select using (true);
create policy "Public read banners" on restaurant_banners for select using (true);
create policy "Public read schedules" on menu_schedules for select using (true);

-- Anyone can insert a visit, only owner reads
create policy "Anyone can track visit" on menu_visits for insert with check (true);

-- ============================================
-- 6. Functions
-- ============================================

-- Returns daily visit counts for the last N days
create or replace function get_visit_stats(p_restaurant_id uuid, p_days integer)
returns table(date text, visits bigint)
language sql stable security definer as $$
  select
    to_char(d::date, 'YYYY-MM-DD') as date,
    count(v.id) as visits
  from generate_series(
    (now() - (p_days || ' days')::interval)::date,
    now()::date,
    '1 day'::interval
  ) d
  left join menu_visits v
    on v.visited_at::date = d::date
    and v.restaurant_id = p_restaurant_id
  group by d
  order by d;
$$;

-- ============================================
-- 7. Seed data
-- ============================================
insert into allergens (id, name, icon) values
  ('gluten', 'Gluten', '🌾'),
  ('crustaceans', 'Crustáceos', '🦐'),
  ('eggs', 'Huevos', '🥚'),
  ('fish', 'Pescado', '🐟'),
  ('peanuts', 'Cacahuetes', '🥜'),
  ('soybeans', 'Soja', '🫘'),
  ('milk', 'Lácteos', '🥛'),
  ('tree_nuts', 'Frutos de cáscara', '🌰'),
  ('celery', 'Apio', '🥬'),
  ('mustard', 'Mostaza', '🟡'),
  ('sesame', 'Sésamo', '⚪'),
  ('sulfites', 'Sulfitos', '💨'),
  ('lupin', 'Altramuces', '🌸'),
  ('mollusks', 'Moluscos', '🐚');
