import { Play } from "lucide-react";

/**
 * Normalise a YouTube/Twitch URL into an embeddable iframe src.
 * Returns null when the URL cannot be turned into a known embed.
 */
export function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
    if (host.endsWith("twitch.tv")) {
      if (u.pathname.startsWith("/videos/")) {
        const id = u.pathname.split("/")[2];
        return id ? `https://player.twitch.tv/?video=${id}&parent=${location.hostname}` : null;
      }
    }
    return url;
  } catch {
    return null;
  }
}

interface VideoEmbedProps {
  url?: string | null;
  title?: string;
  className?: string;
}

export const VideoEmbed = ({ url, title, className = "" }: VideoEmbedProps) => {
  const embed = url ? toEmbedUrl(url) : null;
  if (!embed) {
    return (
      <div
        className={`aspect-video w-full rounded-lg border border-border bg-muted/40 flex flex-col items-center justify-center gap-2 text-muted-foreground ${className}`}
      >
        <Play className="w-8 h-8 opacity-50" />
        <p className="text-sm">Vídeo em breve</p>
      </div>
    );
  }
  return (
    <div className={`aspect-video w-full overflow-hidden rounded-lg border border-border bg-black ${className}`}>
      <iframe
        src={embed}
        title={title || "Vídeo"}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};
