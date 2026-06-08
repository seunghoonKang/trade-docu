import { useEffect, useRef, useState } from "react";
import { Pencil, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { SellerProfile } from "@/entities/seller/model";
import { useAuth, useResolvedAvatarUrl, hasCustomAvatar } from "@/entities/session";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { removeAvatar, uploadAvatar } from "../api/avatar";

interface ProfileHeaderProps {
  profile: SellerProfile;
  className?: string;
}

function getDisplayName(
  user: NonNullable<ReturnType<typeof useAuth>["user"]>,
  profile: SellerProfile,
): string {
  const metadata = user.user_metadata ?? {};
  return (
    (metadata.name as string) ??
    (metadata.full_name as string) ??
    profile.representative ??
    user.email?.split("@")[0] ??
    ""
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileHeader({ profile, className }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(null);
  }, [user?.id, user?.user_metadata?.avatar_url]);

  const { src: avatarUrl, handleError: handleAvatarError } = useResolvedAvatarUrl(user, previewUrl);

  if (!user) return null;

  const displayName = getDisplayName(user, profile);
  const initials = getInitials(displayName);
  const subtitle = profile.companyName || user.email || "";
  const canRemove = hasCustomAvatar(user) || previewUrl !== null;
  const busy = uploading || removing;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadAvatar(user!.id, file);
      setPreviewUrl(url);
      await refreshUser();
      toast.success(t("profile.avatarUploadSuccess"));
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "invalid_avatar") {
        toast.error(t("profile.avatarInvalidFile"));
      } else {
        toast.error(t("profile.avatarUploadFailed"));
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeAvatar(user!.id);
      setPreviewUrl(null);
      await refreshUser();
      toast.success(t("profile.avatarRemoveSuccess"));
    } catch {
      toast.error(t("profile.avatarRemoveFailed"));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section
      className={cn(
        "bg-card rounded-xl border border-border shadow-sm p-6",
        "flex flex-col items-center text-center gap-4",
        "md:flex-row md:items-center md:text-left md:gap-6",
        className,
      )}
    >
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className={cn(
            "flex items-center justify-center bg-secondary border-2 border-accent overflow-hidden",
            "size-24 rounded-full md:rounded-xl transition-opacity",
            "hover:opacity-90 disabled:opacity-60",
          )}
          aria-label={t("profile.avatarChange")}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="size-full object-cover"
              onError={handleAvatarError}
            />
          ) : initials ? (
            <span className="text-2xl font-semibold text-primary">{initials}</span>
          ) : (
            <User className="size-10 text-muted-foreground" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 md:bottom-0 md:right-0 flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-background hover:opacity-90 disabled:opacity-60"
          aria-label={t("profile.avatarChange")}
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-foreground md:text-2xl truncate">
          {displayName || t("profile.unnamed")}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? t("profile.avatarUploading") : t("profile.avatarChange")}
          </Button>
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={handleRemove}
            >
              {removing ? t("profile.avatarRemoving") : t("profile.avatarRemove")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
