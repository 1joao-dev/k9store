
-- Add user_id column to tickets (nullable for anonymous tickets)
ALTER TABLE public.tickets ADD COLUMN user_id uuid DEFAULT NULL;

-- Add RLS policy so authenticated users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update insert policy: allow authenticated users to insert with their user_id
CREATE POLICY "Authenticated users can create tickets"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
