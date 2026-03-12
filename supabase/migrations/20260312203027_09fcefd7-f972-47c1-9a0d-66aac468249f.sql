
-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;

-- Allow anyone to check username availability (public select on username only)
CREATE POLICY "Anyone can check username" ON public.profiles
  FOR SELECT USING (true);

-- Drop the old select policy (redundant now)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- Function to check username availability (no auth required)
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(p_username)
  )
$$;
