import { supabase } from "@/shared/lib/supabase";
import {
  SIGNATURE_BUCKET,
  getSignatureStoragePath,
  getSignatureStoragePaths,
  prepareSignatureFile,
} from "../lib/signature";

export async function uploadSignature(userId: string, file: File): Promise<string> {
  const optimized = await prepareSignatureFile(file);
  const path = getSignatureStoragePath(userId);

  const { error: uploadError } = await supabase.storage
    .from(SIGNATURE_BUCKET)
    .upload(path, optimized, { upsert: true, contentType: optimized.type });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(SIGNATURE_BUCKET).getPublicUrl(path);
  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("sellers")
    .upsert({ user_id: userId, signature_url: publicUrl }, { onConflict: "user_id" });

  if (updateError) throw updateError;
  return publicUrl;
}

export async function removeSignature(userId: string): Promise<void> {
  const { error: removeError } = await supabase.storage
    .from(SIGNATURE_BUCKET)
    .remove(getSignatureStoragePaths(userId));

  if (removeError) throw removeError;

  const { error: updateError } = await supabase
    .from("sellers")
    .upsert({ user_id: userId, signature_url: "" }, { onConflict: "user_id" });

  if (updateError) throw updateError;
}
