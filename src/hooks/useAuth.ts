import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import type { Tables } from '@/integrations/supabase/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do player atual
  const { data: currentPlayer } = useQuery({
    queryKey: ["currentPlayer", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar player atual:", error);
        return null;
      }

      if (data) return data;

      const { data: ensuredPlayer, error: ensureError } = await supabase
        .rpc("ensure_player_profile");

      if (ensureError) {
        console.error("Erro ao criar perfil seguro:", ensureError);
        return null;
      }

      return ensuredPlayer as Tables<"players">;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    currentPlayer,
    data: user // Para compatibilidade com código existente
  };
}
