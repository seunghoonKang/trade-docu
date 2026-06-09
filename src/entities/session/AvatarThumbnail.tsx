import { User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useResolvedAvatarUrl } from "./useResolvedAvatarUrl";
import { cn } from "@/shared/lib/utils";

interface AvatarThumbnailProps {
  user: SupabaseUser;
  className?: string;
  onClick?: () => void;
}

export function AvatarThumbnail({ user, className, onClick }: AvatarThumbnailProps) {
  const { src: avatarUrl, handleError } = useResolvedAvatarUrl(user);
  const name =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "";

  const content = avatarUrl ? (
    <img
      src={avatarUrl}
      alt=""
      className="size-full object-cover"
      onError={handleError}
    />
  ) : (
    (() => {
      const initial = name.trim().charAt(0).toUpperCase();
      return initial ? (
        <span className="text-xs font-semibold text-primary">{initial}</span>
      ) : (
        <User className="size-4 text-muted-foreground" aria-hidden />
      );
    })()
  );

  const classNames = cn(
    "size-8 rounded-full border border-border bg-secondary overflow-hidden shrink-0 flex items-center justify-center",
    onClick && "cursor-pointer hover:opacity-90 transition-opacity",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classNames}>
        {content}
      </button>
    );
  }

  return <span className={classNames}>{content}</span>;
}
