import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  display_order: number;
  topic_count?: number;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  last_reply_at: string | null;
  last_reply_by: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    rank: string | null;
    avatar_url: string | null;
    is_admin: boolean | null;
    is_moderator: boolean | null;
  };
  last_replier?: {
    name: string;
  } | null;
  category?: {
    name: string;
    slug: string;
  };
  reactions_count?: number;
  user_has_reacted?: boolean;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    rank: string | null;
    avatar_url: string | null;
    is_admin: boolean | null;
    is_moderator: boolean | null;
  };
  reactions_count?: number;
  user_has_reacted?: boolean;
}

export const useForum = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch categories with topic counts
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Get topic counts for each category
      const { data: topicCounts } = await supabase
        .from('forum_topics')
        .select('category_id');

      const countMap: Record<string, number> = {};
      topicCounts?.forEach(t => {
        countMap[t.category_id] = (countMap[t.category_id] || 0) + 1;
      });

      return (cats || []).map(cat => ({
        ...cat,
        topic_count: countMap[cat.id] || 0
      })) as ForumCategory[];
    }
  });

  // Fetch topics with author info
  const fetchTopics = async (categorySlug?: string) => {
    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        author:players!forum_topics_author_id_fkey(id, name, rank, avatar_url, is_admin, is_moderator),
        last_replier:players!forum_topics_last_reply_by_fkey(name),
        category:forum_categories(name, slug)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (categorySlug && categorySlug !== 'all') {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ForumTopic[];
  };

  // Create topic mutation
  const createTopic = useMutation({
    mutationFn: async ({ 
      categoryId, 
      title, 
      content, 
      playerId 
    }: { 
      categoryId: string; 
      title: string; 
      content: string; 
      playerId: string;
    }) => {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          category_id: categoryId,
          author_id: playerId,
          title,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success("Tópico criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar tópico: " + error.message);
    }
  });

  // Delete topic mutation
  const deleteTopic = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success("Tópico deletado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao deletar: " + error.message);
    }
  });

  // Toggle pin topic
  const togglePinTopic = useMutation({
    mutationFn: async ({ topicId, isPinned }: { topicId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: isPinned })
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success("Tópico atualizado!");
    }
  });

  // Toggle lock topic
  const toggleLockTopic = useMutation({
    mutationFn: async ({ topicId, isLocked }: { topicId: string; isLocked: boolean }) => {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_locked: isLocked })
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success("Tópico atualizado!");
    }
  });

  // Increment view count (simple increment)
  const incrementViewCount = async (topicId: string) => {
    // Get current count and increment
    const { data } = await supabase
      .from('forum_topics')
      .select('views_count')
      .eq('id', topicId)
      .single();
    
    if (data) {
      await supabase
        .from('forum_topics')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', topicId);
    }
  };

  // Fetch replies for a topic
  const fetchReplies = async (topicId: string) => {
    const { data, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        author:players!forum_replies_author_id_fkey(id, name, rank, avatar_url, is_admin, is_moderator)
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ForumReply[];
  };

  // Create reply mutation
  const createReply = useMutation({
    mutationFn: async ({ 
      topicId, 
      content, 
      playerId 
    }: { 
      topicId: string; 
      content: string; 
      playerId: string;
    }) => {
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: topicId,
          author_id: playerId,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success("Resposta enviada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao responder: " + error.message);
    }
  });

  // Delete reply mutation
  const deleteReply = useMutation({
    mutationFn: async ({ replyId, topicId }: { replyId: string; topicId: string }) => {
      const { error } = await supabase
        .from('forum_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success("Resposta deletada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao deletar: " + error.message);
    }
  });

  // Toggle reaction
  const toggleReaction = useMutation({
    mutationFn: async ({ 
      topicId, 
      replyId, 
      playerId 
    }: { 
      topicId?: string; 
      replyId?: string; 
      playerId: string;
    }) => {
      // Check if reaction exists
      let query = supabase
        .from('forum_reactions')
        .select('id')
        .eq('user_id', playerId);

      if (topicId) query = query.eq('topic_id', topicId);
      if (replyId) query = query.eq('reply_id', replyId);

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        // Remove reaction
        await supabase
          .from('forum_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase
          .from('forum_reactions')
          .insert({
            user_id: playerId,
            topic_id: topicId || null,
            reply_id: replyId || null,
            reaction_type: 'like'
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-replies'] });
    }
  });

  // Get forum stats
  const { data: forumStats } = useQuery({
    queryKey: ['forum-stats'],
    queryFn: async () => {
      const [topicsRes, repliesRes, usersRes] = await Promise.all([
        supabase.from('forum_topics').select('id', { count: 'exact', head: true }),
        supabase.from('forum_replies').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalTopics: topicsRes.count || 0,
        totalPosts: (topicsRes.count || 0) + (repliesRes.count || 0),
        activeUsers: usersRes.count || 0,
        onlineNow: Math.max(Math.floor((usersRes.count || 0) * 0.1), 1)
      };
    }
  });

  return {
    categories,
    categoriesLoading,
    fetchTopics,
    fetchReplies,
    forumStats,
    createTopic,
    deleteTopic,
    togglePinTopic,
    toggleLockTopic,
    incrementViewCount,
    createReply,
    deleteReply,
    toggleReaction
  };
};
