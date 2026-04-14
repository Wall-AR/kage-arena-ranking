
-- Fix forum_reactions RLS bug
DROP POLICY IF EXISTS "Usuários podem reagir" ON public.forum_reactions;
CREATE POLICY "Usuários podem reagir" ON public.forum_reactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM players WHERE players.id = forum_reactions.user_id AND players.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Usuários podem remover suas reações" ON public.forum_reactions;
CREATE POLICY "Usuários podem remover suas reações" ON public.forum_reactions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM players WHERE players.id = forum_reactions.user_id AND players.user_id = auth.uid())
  );

-- Make player_achievements publicly visible
DROP POLICY IF EXISTS "Jogadores podem ver suas conquistas" ON public.player_achievements;
CREATE POLICY "Conquistas visíveis por todos" ON public.player_achievements
  FOR SELECT USING (true);

-- Make player_banners publicly visible
DROP POLICY IF EXISTS "Jogadores podem ver seus banners" ON public.player_banners;
CREATE POLICY "Banners visíveis por todos" ON public.player_banners
  FOR SELECT USING (true);

-- Fix notifications INSERT
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notifications;
CREATE POLICY "Sistema pode criar notificações" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR is_moderator(auth.uid())
  );

-- Admin UPDATE/DELETE for matches
CREATE POLICY "Admins podem atualizar partidas" ON public.matches
  FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins podem deletar partidas" ON public.matches
  FOR DELETE USING (is_admin(auth.uid()));

-- Admin DELETE for challenges
CREATE POLICY "Admins podem deletar desafios" ON public.challenges
  FOR DELETE USING (is_admin(auth.uid()));

-- Moderators can insert ranking_changes
CREATE POLICY "Moderadores podem inserir mudanças de ranking" ON public.ranking_changes
  FOR INSERT WITH CHECK (is_moderator(auth.uid()));
