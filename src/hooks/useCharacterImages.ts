import { useQuery } from "@tanstack/react-query";
import {
  CHARACTER_IMAGE_MAP,
  CHARACTER_IMAGE_LV2_MAP,
  DEFAULT_CHARACTER_IMAGE,
} from "@/data/characterImages";

export const useCharacterImages = () => {
  return useQuery({
    queryKey: ["character-images"],
    queryFn: async () => [],
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Returns the CDN URL for a given character name.
 * Falls back to the "Não definido" placeholder when the character is unknown
 * or has not been selected yet.
 *
 * The second argument is kept for backwards-compatibility with existing call
 * sites (previously a list of DB rows); it is ignored.
 */
export const getCharacterImageUrl = (
  characterName?: string | null,
  _characterImages: unknown = []
): string => {
  if (!characterName) return DEFAULT_CHARACTER_IMAGE;
  return CHARACTER_IMAGE_MAP[characterName] ?? DEFAULT_CHARACTER_IMAGE;
};

/**
 * Returns the Level 2 (transformed) variant URL when one exists for the
 * given character, otherwise null.
 */
export const getCharacterImageLv2Url = (
  characterName?: string | null
): string | null => {
  if (!characterName) return null;
  return CHARACTER_IMAGE_LV2_MAP[characterName] ?? null;
};

export { DEFAULT_CHARACTER_IMAGE };
