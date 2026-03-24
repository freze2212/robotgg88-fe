/**
 * Carousel desktop — thời lượng đồng bộ với CSS (--lobby-carousel-duration).
 */
export const LOBBY_CAROUSEL = {
  FALLBACK_EXIT_MS: 900,
  FALLBACK_ENTER_MS: 700,
} as const;

export type TrackPhase =
  | "idle"
  | "exit-next"
  | "enter-next"
  | "exit-prev"
  | "enter-prev";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
