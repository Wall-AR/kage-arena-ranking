import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: 'challenge' | 'evaluation' | 'tournament' | 'match';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Buscar desafios pendentes
  const { data: pendingChallenges } = useQuery({
    queryKey: ['pending-challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: playerData } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!playerData) return [];

      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger:players!challenges_challenger_id_fkey(name, rank),
          challenged:players!challenges_challenged_id_fkey(name, rank)
        `)
        .eq('challenged_id', playerData.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Buscar solicitações de avaliação (para moderadores)
  const { data: evaluationRequests } = useQuery({
    queryKey: ['evaluation-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!playerData?.is_moderator) return [];

      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          player:players!evaluations_player_id_fkey(name, rank)
        `)
        .eq('status', 'pending')
        .is('evaluator_id', null);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Notificações de desafios
    if (pendingChallenges) {
      pendingChallenges.forEach(challenge => {
        newNotifications.push({
          id: `challenge-${challenge.id}`,
          type: 'challenge',
          title: 'Novo Desafio',
          message: `${challenge.challenger?.name} te desafiou para um ${challenge.match_type}`,
          read: false,
          created_at: challenge.created_at,
          data: challenge
        });
      });
    }

    // Notificações de avaliação (para moderadores)
    if (evaluationRequests) {
      evaluationRequests.forEach(evaluation => {
        newNotifications.push({
          id: `evaluation-${evaluation.id}`,
          type: 'evaluation',
          title: 'Solicitação de Avaliação',
          message: `${evaluation.player?.name} solicitou avaliação de rank`,
          read: false,
          created_at: evaluation.created_at,
          data: evaluation
        });
      });
    }

    setNotifications(newNotifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  }, [pendingChallenges, evaluationRequests]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};