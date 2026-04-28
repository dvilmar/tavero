-- Migration: 20260428000001_add_menu_accent
-- Adds menu_accent_color preference to restaurants table

alter table public.restaurants
  add column if not exists menu_accent_color text not null default 'amber';
