
-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dono';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'suporte';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cliente_vip';
