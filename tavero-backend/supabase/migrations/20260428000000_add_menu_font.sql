-- Migration: 20260428000000_add_menu_font
-- Adds menu_font preference to restaurants table

alter table public.restaurants
  add column if not exists menu_font text not null default 'inter';
