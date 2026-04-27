-- ============================================================
-- Migration: 20260426000001_rls_policies.sql
-- Description: Row Level Security for all tables
-- Run this AFTER 20260426000000_initial_schema.sql
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.restaurants          enable row level security;
alter table public.categories           enable row level security;
alter table public.products             enable row level security;
alter table public.product_availability enable row level security;

-- ============================================================
-- RESTAURANTS
-- ============================================================

-- Authenticated owner: full CRUD on their own restaurants
create policy "owner can select own restaurants"
  on public.restaurants for select
  to authenticated
  using (user_id = auth.uid());

create policy "owner can insert own restaurants"
  on public.restaurants for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "owner can update own restaurants"
  on public.restaurants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "owner can delete own restaurants"
  on public.restaurants for delete
  to authenticated
  using (user_id = auth.uid());

-- Public (anon): read-only, only active restaurants
-- Used by the public menu page to resolve /menu/[slug]
create policy "public can read active restaurants"
  on public.restaurants for select
  to anon
  using (is_active = true);

-- ============================================================
-- CATEGORIES
-- ============================================================

-- Authenticated owner: full CRUD on categories of their restaurants
create policy "owner can select own categories"
  on public.categories for select
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

create policy "owner can insert own categories"
  on public.categories for insert
  to authenticated
  with check (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

create policy "owner can update own categories"
  on public.categories for update
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  )
  with check (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

create policy "owner can delete own categories"
  on public.categories for delete
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

-- Public (anon): read-only, only active categories of active restaurants
create policy "public can read active categories"
  on public.categories for select
  to anon
  using (
    is_active = true
    and restaurant_id in (
      select id from public.restaurants where is_active = true
    )
  );

-- ============================================================
-- PRODUCTS
-- ============================================================

-- Authenticated owner: full CRUD on products of their restaurants
create policy "owner can select own products"
  on public.products for select
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

create policy "owner can insert own products"
  on public.products for insert
  to authenticated
  with check (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

create policy "owner can update own products"
  on public.products for update
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  )
  with check (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

create policy "owner can delete own products"
  on public.products for delete
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where user_id = auth.uid()
    )
  );

-- Public (anon): read-only, only active products of active restaurants
create policy "public can read active products"
  on public.products for select
  to anon
  using (
    is_active = true
    and restaurant_id in (
      select id from public.restaurants where is_active = true
    )
  );

-- ============================================================
-- PRODUCT_AVAILABILITY
-- ============================================================

-- Authenticated owner: full CRUD via product ownership chain
create policy "owner can select own product availability"
  on public.product_availability for select
  to authenticated
  using (
    product_id in (
      select id from public.products
      where restaurant_id in (
        select id from public.restaurants where user_id = auth.uid()
      )
    )
  );

create policy "owner can insert own product availability"
  on public.product_availability for insert
  to authenticated
  with check (
    product_id in (
      select id from public.products
      where restaurant_id in (
        select id from public.restaurants where user_id = auth.uid()
      )
    )
  );

create policy "owner can update own product availability"
  on public.product_availability for update
  to authenticated
  using (
    product_id in (
      select id from public.products
      where restaurant_id in (
        select id from public.restaurants where user_id = auth.uid()
      )
    )
  )
  with check (
    product_id in (
      select id from public.products
      where restaurant_id in (
        select id from public.restaurants where user_id = auth.uid()
      )
    )
  );

create policy "owner can delete own product availability"
  on public.product_availability for delete
  to authenticated
  using (
    product_id in (
      select id from public.products
      where restaurant_id in (
        select id from public.restaurants where user_id = auth.uid()
      )
    )
  );

-- Public (anon): read-only (availability data is non-sensitive)
create policy "public can read product availability"
  on public.product_availability for select
  to anon
  using (true);
