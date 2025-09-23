-- Adicionar campo para controlar quando o usuário pode alterar perfil novamente
ALTER TABLE public.players 
ADD COLUMN last_profile_update timestamp with time zone DEFAULT null;

-- Função para verificar se pode atualizar perfil (33 dias de cooldown)
CREATE OR REPLACE FUNCTION public.can_update_profile_settings(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  last_update timestamp with time zone;
BEGIN
  SELECT last_profile_update INTO last_update 
  FROM public.players 
  WHERE players.user_id = $1;
  
  -- Se nunca atualizou ou já passou 33 dias
  IF last_update IS NULL OR (now() - last_update) >= interval '33 days' THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;