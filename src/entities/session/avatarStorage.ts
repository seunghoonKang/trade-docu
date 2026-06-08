import { supabase } from "@/shared/lib/supabase";
import { AVATAR_BUCKET, getAvatarStoragePath } from "./avatar";

export function getStoredAvatarPublicUrl(userId: string): string {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(getAvatarStoragePath(userId));
  return data.publicUrl;
}
