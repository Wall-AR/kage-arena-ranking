import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: unknown;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: storedNotifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: !!notification.is_read,
        created_at: notification.created_at,
        data: notification.data
      })) as Notification[];
    },
    enabled: !!user
  });

  const { data: pendingChallenges } = useQuery({
    queryKey: ["pending-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: playerData } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!playerData) return [];

      const { data, error } = await supabase
        .from("challenges")
        .select(`
          *,
          challenger:players!challenges_challenger_id_fkey(name, rank),
          challenged:players!challenges_challenged_id_fkey(name, rank)
        `)
        .eq("challenged_id", playerData.id)
        .eq("status", "pending");

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const { data: evaluationRequests } = useQuery({
    queryKey: ["evaluation-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: playerData } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!playerData?.is_moderator && !playerData?.is_admin) return [];

      const { data, error } = await supabase
        .from("evaluations")
        .select(`
          *,
          player:players!evaluations_player_id_fkey(name, rank)
        `)
        .eq("status", "pending")
        .is("evaluator_id", null);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  useEffect(() => {
    const newNotifications: Notification[] = [...(storedNotifications || [])];

    const hasStoredReference = (key: string, id: string) =>
      newNotifications.some((notification) => {
        if (!notification.data || typeof notification.data !== "object" || Array.isArray(notification.data)) {
          return false;
        }

        return (notification.data as Record<string, unknown>)[key] === id;
      });

    if (pendingChallenges) {
      pendingChallenges.forEach((challenge) => {
        if (hasStoredReference("challenge_id", challenge.id)) return;

        newNotifications.push({
          id: `challenge-${challenge.id}`,
          type: "challenge",
          title: "Novo desafio",
          message: `${challenge.challenger?.name} te desafiou para um ${challenge.match_type}`,
          read: false,
          created_at: challenge.created_at,
          data: challenge
        });
      });
    }

    if (evaluationRequests) {
      evaluationRequests.forEach((evaluation) => {
        if (hasStoredReference("evaluation_id", evaluation.id)) return;

        newNotifications.push({
          id: `evaluation-${evaluation.id}`,
          type: "evaluation",
          title: "Solicitação de avaliação",
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
  }, [pendingChallenges, evaluationRequests, storedNotifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const isStoredNotification = (notificationId: string) =>
    !notificationId.startsWith("challenge-") && !notificationId.startsWith("evaluation-");

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );

    if (user?.id && isStoredNotification(notificationId)) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));

    if (user?.id) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
