import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AcademyAttributes = {
  strength: number;
  speed: number;
  technique: number;
  defense: number;
  mobility: number;
  versatility: number;
};

export type AcademyCharacter = {
  id: string;
  slug: string;
  name: string;
  tier: string;
  image_url: string;
  image_lv2_url: string | null;
  short_description: string | null;
  full_description: string | null;
  playstyle: string | null;
  difficulty: string | null;
  attributes: AcademyAttributes;
  strengths: string[];
  weaknesses: string[];
  favorable_against: string[];
  unfavorable_against: string[];
  recommended_for: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type AcademyMove = {
  id: string;
  character_id: string;
  name: string;
  move_type: string;
  command: string | null;
  video_url: string | null;
  description: string;
  damage_rating: number | null;
  difficulty: string | null;
  sort_order: number;
  created_by: string | null;
  author?: { id: string; name: string; avatar_url: string | null; is_admin: boolean | null; is_moderator: boolean | null } | null;
};

export type AcademyCombo = {
  id: string;
  character_id: string;
  name: string;
  inputs: string;
  difficulty: string;
  damage_estimate: string | null;
  video_url: string | null;
  situation: string | null;
  notes: string | null;
  sort_order: number;
  created_by: string | null;
  author?: { id: string; name: string; avatar_url: string | null; is_admin: boolean | null; is_moderator: boolean | null } | null;
};


export type AcademyTopic = {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string | null;
  summary: string | null;
  content: string;
  video_url: string | null;
  is_pinned: boolean;
  is_published: boolean;
  sort_order: number;
};

export type AcademyCommentedMatch = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  player_a_name: string | null;
  player_b_name: string | null;
  character_a: string | null;
  character_b: string | null;
  winner: string | null;
  commentator: string | null;
  tier: string | null;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
};

const QK = {
  characters: ["academy", "characters"] as const,
  character: (slug: string) => ["academy", "character", slug] as const,
  moves: (id: string) => ["academy", "moves", id] as const,
  combos: (id: string) => ["academy", "combos", id] as const,
  topics: ["academy", "topics"] as const,
  matches: ["academy", "commented-matches"] as const,
};

export const useAcademyCharacters = () =>
  useQuery({
    queryKey: QK.characters,
    queryFn: async (): Promise<AcademyCharacter[]> => {
      const { data, error } = await supabase
        .from("academy_characters")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as AcademyCharacter[];
    },
  });

export const useAcademyCharacterBySlug = (slug?: string) =>
  useQuery({
    queryKey: QK.character(slug ?? ""),
    enabled: !!slug,
    queryFn: async (): Promise<AcademyCharacter | null> => {
      const { data, error } = await supabase
        .from("academy_characters")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as AcademyCharacter | null;
    },
  });

export const useAcademyMoves = (characterId?: string) =>
  useQuery({
    queryKey: QK.moves(characterId ?? ""),
    enabled: !!characterId,
    queryFn: async (): Promise<AcademyMove[]> => {
      const { data, error } = await supabase
        .from("academy_character_moves")
        .select("*, author:players!academy_character_moves_created_by_fkey(id,name,avatar_url,is_admin,is_moderator)")
        .eq("character_id", characterId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as AcademyMove[];
    },
  });

export const useAcademyCombos = (characterId?: string) =>
  useQuery({
    queryKey: QK.combos(characterId ?? ""),
    enabled: !!characterId,
    queryFn: async (): Promise<AcademyCombo[]> => {
      const { data, error } = await supabase
        .from("academy_character_combos")
        .select("*, author:players!academy_character_combos_created_by_fkey(id,name,avatar_url,is_admin,is_moderator)")
        .eq("character_id", characterId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as AcademyCombo[];
    },
  });


export const useAcademyTopics = () =>
  useQuery({
    queryKey: QK.topics,
    queryFn: async (): Promise<AcademyTopic[]> => {
      const { data, error } = await supabase
        .from("academy_topics")
        .select("*")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AcademyTopic[];
    },
  });

export const useAcademyCommentedMatches = () =>
  useQuery({
    queryKey: QK.matches,
    queryFn: async (): Promise<AcademyCommentedMatch[]> => {
      const { data, error } = await supabase
        .from("academy_commented_matches")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AcademyCommentedMatch[];
    },
  });

// ===== Admin Mutations =====
export const useUpsertAcademyCharacter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AcademyCharacter> & { id?: string }) => {
      if (payload.id) {
        const { error } = await supabase
          .from("academy_characters")
          .update(payload as never)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("academy_characters").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy"] });
      toast.success("Personagem salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteAcademyCharacter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("academy_characters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy"] });
      toast.success("Personagem removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpsertAcademyMove = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AcademyMove> & { id?: string; character_id: string }) => {
      const clean: Record<string, unknown> = { ...payload };
      delete clean.author;
      if (payload.id) {
        delete clean.created_by;
        const { error } = await supabase.from("academy_character_moves").update(clean as never).eq("id", payload.id);
        if (error) throw error;
      } else {
        if (!clean.created_by) {
          const { data: u } = await supabase.auth.getUser();
          if (u.user) {
            const { data: p } = await supabase.from("players").select("id").eq("user_id", u.user.id).maybeSingle();
            if (p) clean.created_by = p.id;
          }
        }
        const { error } = await supabase.from("academy_character_moves").insert(clean as never);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: QK.moves(v.character_id) });
      toast.success("Habilidade salva");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};


export const useDeleteAcademyMove = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; character_id: string }) => {
      const { error } = await supabase.from("academy_character_moves").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: QK.moves(v.character_id) });
      toast.success("Habilidade removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpsertAcademyCombo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AcademyCombo> & { id?: string; character_id: string }) => {
      const clean: Record<string, unknown> = { ...payload };
      delete clean.author;
      if (payload.id) {
        delete clean.created_by;
        const { error } = await supabase.from("academy_character_combos").update(clean as never).eq("id", payload.id);
        if (error) throw error;
      } else {
        if (!clean.created_by) {
          const { data: u } = await supabase.auth.getUser();
          if (u.user) {
            const { data: p } = await supabase.from("players").select("id").eq("user_id", u.user.id).maybeSingle();
            if (p) clean.created_by = p.id;
          }
        }
        const { error } = await supabase.from("academy_character_combos").insert(clean as never);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: QK.combos(v.character_id) });
      toast.success("Combo salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};


export const useDeleteAcademyCombo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; character_id: string }) => {
      const { error } = await supabase.from("academy_character_combos").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: QK.combos(v.character_id) });
      toast.success("Combo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpsertAcademyTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AcademyTopic> & { id?: string }) => {
      if (payload.id) {
        const { error } = await supabase.from("academy_topics").update(payload as never).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("academy_topics").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.topics });
      toast.success("Tópico salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteAcademyTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("academy_topics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.topics });
      toast.success("Tópico removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpsertAcademyCommentedMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AcademyCommentedMatch> & { id?: string }) => {
      if (payload.id) {
        const { error } = await supabase.from("academy_commented_matches").update(payload as never).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("academy_commented_matches").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.matches });
      toast.success("Partida salva");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteAcademyCommentedMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("academy_commented_matches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.matches });
      toast.success("Partida removida");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
