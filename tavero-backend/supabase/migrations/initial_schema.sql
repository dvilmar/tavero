-- ============================================================
-- Migration: 20260426000000_initial_schema.sql
-- Description: Core tables for QR digital menu app
-- Run this first in Supabase SQL Editor before the RLS migration
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- Helper: auto-update updated_at column
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- Table: restaurants
-- One row per restaurant/bar. Linked to a Supabase Auth user.
-- slug is used in the public URL: /menu/[slug]
-- ============================================================
create table if not exists public.restaurants (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists restaurants_user_id_idx on public.restaurants(user_id);
create index if not exists restaurants_slug_idx on public.restaurants(slug);

drop trigger if exists restaurants_updated_at on public.restaurants;
create trigger restaurants_updated_at
  before update on public.restaurants
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Table: categories
-- Groups of products within a restaurant (e.g. Tapas, Drinks)
-- sort_order controls display order in the menu
-- ============================================================
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name          text not null,
  description   text,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists categories_restaurant_id_idx on public.categories(restaurant_id);

-- ============================================================
-- Table: products
-- Individual menu items. restaurant_id is denormalized here
-- to keep RLS policies simple without extra joins.
-- ============================================================
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10, 2) not null check (price >= 0),
  image_url     text,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_id_idx   on public.products(category_id);
create index if not exists products_restaurant_id_idx on public.products(restaurant_id);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Table: product_availability
-- Controls which days of the week a product is available.
--
-- Convention:
--   0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday,
--   4 = Thursday, 5 = Friday, 6 = Saturday
--
-- If a product has NO rows here → available every day.
-- If a product HAS rows → available only on those days.
-- ============================================================
create table if not exists public.product_availability (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  unique(product_id, day_of_week)
);

create index if not exists product_availability_product_id_idx on public.product_availability(product_id);
