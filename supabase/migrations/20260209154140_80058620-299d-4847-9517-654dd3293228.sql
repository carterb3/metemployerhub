-- Add new region enum values
ALTER TYPE public.manitoba_region ADD VALUE IF NOT EXISTS 'southwest';
ALTER TYPE public.manitoba_region ADD VALUE IF NOT EXISTS 'beyond_borders';