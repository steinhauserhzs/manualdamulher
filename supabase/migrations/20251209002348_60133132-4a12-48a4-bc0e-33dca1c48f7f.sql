-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Sistema cria notificações" ON notificacoes;

-- Create a more restrictive INSERT policy
-- Users can only create notifications for themselves, or admins can create for anyone
CREATE POLICY "Usuárias ou admins criam notificações" 
ON notificacoes 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);