-- Criar função para criar automaticamente um perfil de jogador quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Inserir novo jogador com dados básicos
  INSERT INTO public.players (
    user_id,
    name,
    rank,
    rank_level,
    is_ranked,
    points,
    current_points,
    wins,
    losses,
    win_streak,
    ninja_phrase,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)), -- Usar nome do metadata ou parte do email
    'Unranked',
    'Unranked',
    false,
    0,
    0,
    0,
    0,
    0,
    'Esse é o meu jeito ninja de ser!',
    'player'
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para chamar a função quando um novo usuário for criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();