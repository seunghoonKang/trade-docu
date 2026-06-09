import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getAvatarUrl } from "./avatar";
import { getStoredAvatarPublicUrl } from "./avatarStorage";

export function useResolvedAvatarUrl(
  user: User | null | undefined,
  previewUrl?: string | null,
) {
  const [src, setSrc] = useState<string | null>(null);
  const [storageTried, setStorageTried] = useState(false);

  useEffect(() => {
    setStorageTried(false);
    setSrc(previewUrl ?? getAvatarUrl(user ?? null));
  }, [
    previewUrl,
    user?.id,
    user?.user_metadata?.avatar_url,
    user?.user_metadata?.picture,
    user?.user_metadata?.avatar,
    user?.user_metadata?.profile_image,
  ]);

  function handleError() {
    if (previewUrl || !user || storageTried) {
      setSrc(null);
      return;
    }

    setStorageTried(true);
    setSrc(getStoredAvatarPublicUrl(user.id));
  }

  return { src, handleError };
}
