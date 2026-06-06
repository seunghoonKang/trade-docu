import { supabase } from "@/shared/lib/supabase";
import { AVATAR_BUCKET, getAvatarStoragePath, getAvatarStoragePaths } from "../lib/avatar";
import { AVATAR_OUTPUT_TYPE, prepareAvatarFile } from "../lib/optimizeAvatar";

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const optimized = await prepareAvatarFile(file);
  const path = getAvatarStoragePath(userId);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, optimized, { upsert: true, contentType: AVATAR_OUTPUT_TYPE });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { data: authData, error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });
  if (updateError) throw updateError;
  if (!authData.user) throw new Error("User not found after avatar update");

  return (
    (authData.user.user_metadata?.avatar_url as string | undefined) ?? publicUrl
  );
}

export async function removeAvatar(userId: string): Promise<void> {
  const { error: removeError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove(getAvatarStoragePaths(userId));

  if (removeError) throw removeError;

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: "" },
  });
  if (updateError) throw updateError;
}
