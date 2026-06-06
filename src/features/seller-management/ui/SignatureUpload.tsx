import { useRef, useState } from "react";
import { ImagePlus, PenLine, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { removeSignature, uploadSignature } from "../api/signature";

interface Props {
  userId: string;
  signatureUrl: string;
  onSignatureChange: (url: string) => void;
  className?: string;
}

export function SignatureUpload({ userId, signatureUrl, onSignatureChange, className }: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const busy = uploading || removing;
  const displayUrl = previewUrl ?? signatureUrl;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadSignature(userId, file);
      setPreviewUrl(url);
      onSignatureChange(url);
      toast.success(t("profile.signatureUploadSuccess"));
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "invalid_signature") {
        toast.error(t("profile.signatureInvalidFile"));
      } else {
        toast.error(t("profile.signatureUploadFailed"));
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeSignature(userId);
      setPreviewUrl(null);
      onSignatureChange("");
      toast.success(t("profile.signatureRemoveSuccess"));
    } catch {
      toast.error(t("profile.signatureRemoveFailed"));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-sm font-medium text-foreground">{t("profile.signatureTitle")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("profile.signatureHint")}</p>
      </div>

      <div
        className={cn(
          "relative flex min-h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-4",
          displayUrl ? "bg-white" : "",
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className="max-h-24 max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <PenLine className="size-8" aria-hidden />
            <span className="text-xs">{t("profile.signatureEmpty")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden />
          {uploading ? t("profile.signatureUploading") : t("profile.signatureUpload")}
        </Button>
        {displayUrl && (
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={handleRemove}>
            <X className="size-4" aria-hidden />
            {removing ? t("profile.signatureRemoving") : t("profile.signatureRemove")}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
