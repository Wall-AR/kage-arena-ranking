
-- 1. Privilege escalation fix: bloquear que usuários alterem campos de privilégio
CREATE OR REPLACE FUNCTION public.prevent_player_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Permite se for admin ou se for um trigger interno (sem auth.uid)
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Caso contrário, força manter os valores antigos para campos sensíveis
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     OR NEW.is_moderator IS DISTINCT FROM OLD.is_moderator
     OR NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Não autorizado a alterar campos de privilégio (is_admin, is_moderator, role)';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS players_prevent_privilege_escalation ON public.players;
CREATE TRIGGER players_prevent_privilege_escalation
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.prevent_player_privilege_escalation();

-- 2. Redemption codes: remover leitura pública, só admins veem; resgate via RPC já existente (redeem_code) com SECURITY DEFINER
DROP POLICY IF EXISTS "Códigos ativos são visíveis por todos" ON public.redemption_codes;

-- 3. Evaluations: restringir leitura ao jogador avaliado, avaliador e moderadores
DROP POLICY IF EXISTS "Avaliações visíveis por todos ou configuração privada" ON public.evaluations;

CREATE POLICY "Avaliações visíveis aos envolvidos e moderadores"
ON public.evaluations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.id = evaluations.player_id AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.id = evaluations.evaluator_id AND p.user_id = auth.uid()
  )
  OR public.is_moderator(auth.uid())
);
