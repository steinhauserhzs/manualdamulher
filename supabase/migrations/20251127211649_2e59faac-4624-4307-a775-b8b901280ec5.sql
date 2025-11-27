-- Corrigir search_path da função update_comunidade_posts_updated_at
DROP TRIGGER IF EXISTS update_comunidade_posts_updated_at ON public.comunidade_posts;
DROP FUNCTION IF EXISTS public.update_comunidade_posts_updated_at();

CREATE OR REPLACE FUNCTION public.update_comunidade_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_comunidade_posts_updated_at
BEFORE UPDATE ON public.comunidade_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_comunidade_posts_updated_at();