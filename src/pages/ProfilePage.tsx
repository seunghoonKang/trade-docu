import { useEffect, useRef, useState } from "react";
import { Building2, Info, Landmark, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input } from "@/shared/ui";
import { useAuth } from "@/app/providers/AuthProvider";
import { clearOAuthLinkCallbackUrl, consumeOAuthLinkCallback } from "@/features/auth/lib/oauthLinkCallback";
import i18n from "@/shared/i18n/config";
import { LinkedAuthMethods } from "@/features/auth/ui/LinkedAuthMethods";
import { restoreAvatarMetadataIfNeeded } from "@/features/profile/api/avatar";
import { ProfileHeader, ProfilePageHeader, ProfilePageSkeleton, ProfileSectionCard } from "@/features/profile";
import {
  getSeller,
  upsertSeller,
  seedSellerFromMetadata,
  SignatureUpload,
  type SellerProfile,
} from "@/features/seller-management";
import { AppSidebar } from "@/widgets/AppSidebar";
import { cn } from "@/shared/lib/utils";

interface ProfileFormFieldsProps {
  profile: SellerProfile;
  onUpdate: (key: keyof SellerProfile, value: string) => void;
}

function CompanyFields({ profile, onUpdate, userId, onSignatureChange }: ProfileFormFieldsProps & {
  userId: string;
  onSignatureChange: (url: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Input
        label={t("form.companyName")}
        value={profile.companyName}
        onChange={(e) => onUpdate("companyName", e.target.value)}
      />
      <Input
        label={t("form.representative")}
        value={profile.representative}
        onChange={(e) => onUpdate("representative", e.target.value)}
      />
      <Input
        label={t("form.address")}
        value={profile.address}
        onChange={(e) => onUpdate("address", e.target.value)}
      />
      <Input
        label={t("form.tel")}
        value={profile.tel}
        onChange={(e) => onUpdate("tel", e.target.value)}
      />
      <Input
        label={t("form.fax")}
        value={profile.fax}
        onChange={(e) => onUpdate("fax", e.target.value)}
      />
      <SignatureUpload
        userId={userId}
        signatureUrl={profile.signatureUrl}
        onSignatureChange={onSignatureChange}
        className="pt-2 border-t border-border"
      />
    </div>
  );
}

function BankFields({ profile, onUpdate }: ProfileFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Input
        label={t("form.bankName")}
        value={profile.bankName}
        onChange={(e) => onUpdate("bankName", e.target.value)}
      />
      <Input
        label={t("form.bankSwift")}
        value={profile.bankSwift}
        onChange={(e) => onUpdate("bankSwift", e.target.value)}
      />
      <Input
        label={t("form.accountNo")}
        value={profile.accountNo}
        onChange={(e) => onUpdate("accountNo", e.target.value)}
      />
      <Input
        label={t("form.accountee")}
        value={profile.accountee}
        onChange={(e) => onUpdate("accountee", e.target.value)}
      />
      <Input
        label={t("form.bankAddress")}
        value={profile.bankAddress}
        onChange={(e) => onUpdate("bankAddress", e.target.value)}
      />
      <Input
        label={t("form.bankTel")}
        value={profile.bankTel}
        onChange={(e) => onUpdate("bankTel", e.target.value)}
      />
      <Input
        label={t("form.bankFax")}
        value={profile.bankFax}
        onChange={(e) => onUpdate("bankFax", e.target.value)}
      />
      <p className="text-xs text-muted-foreground flex items-start gap-1.5 p-3 bg-secondary/60 rounded-lg border border-dashed border-border">
        <Info className="size-3.5 mt-0.5 shrink-0" aria-hidden />
        {t("profile.bankHint")}
      </p>
    </div>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const oauthLinkCallbackHandled = useRef(false);
  const avatarRestoredForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (avatarRestoredForUserRef.current === user.id) return;
    avatarRestoredForUserRef.current = user.id;

    void restoreAvatarMetadataIfNeeded(user).then((restored) => {
      if (restored) void refreshUser();
    });
  }, [user?.id, refreshUser, user]);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    getSeller(user.id).then((seller) => {
      setProfile(seedSellerFromMetadata(currentUser, seller));
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user || oauthLinkCallbackHandled.current) return;

    const result = consumeOAuthLinkCallback(user, i18n.t.bind(i18n));
    if (!result) return;

    oauthLinkCallbackHandled.current = true;
    clearOAuthLinkCallbackUrl();

    if (result.type === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }, [user]);

  function update(key: keyof SellerProfile, value: string) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await upsertSeller(
        user.id,
        {
          companyName: profile.companyName,
          address: profile.address,
          tel: profile.tel,
          fax: profile.fax,
          representative: profile.representative,
          signatureUrl: profile.signatureUrl,
        },
        {
          bankName: profile.bankName,
          bankSwift: profile.bankSwift,
          accountNo: profile.accountNo,
          accountee: profile.accountee,
          bankAddress: profile.bankAddress,
          bankTel: profile.bankTel,
          bankFax: profile.bankFax,
        },
      );
      toast.success(t("profile.saved"));
      navigate("/");
    } catch {
      toast.error(t("profile.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (!loading && !user) return <Navigate to="/login" replace />;
  if (loading || !user || !profile) return <ProfilePageSkeleton />;

  const saveButton = (className?: string) => (
    <Button
      variant="default"
      size="lg"
      onClick={handleSave}
      disabled={saving}
      className={className}
    >
      <Save aria-hidden />
      {saving ? t("profile.saving") : t("profile.saveChanges")}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <ProfilePageHeader
        user={user}
        saving={saving}
        onBack={() => navigate("/")}
        onSave={handleSave}
      />
      <AppSidebar />

      <div className="md:pl-[72px]">
        <main
          className={cn(
            "max-w-4xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 mt-16 md:mt-0 pb-28 md:pb-8",
          )}
        >
        <p className="text-sm text-muted-foreground hidden md:block">{t("profile.subtitle")}</p>

        <ProfileHeader profile={profile} />

        <LinkedAuthMethods />

        {/* Desktop: 2-column company + bank */}
        <div className="hidden md:grid lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Building2 className="size-5" aria-hidden />
              {t("profile.businessProfile")}
            </h3>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <CompanyFields
                profile={profile}
                onUpdate={update}
                userId={user.id}
                onSignatureChange={(url) => update("signatureUrl", url)}
              />
            </div>
          </section>
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Landmark className="size-5" aria-hidden />
              {t("profile.financialInfo")}
            </h3>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <BankFields profile={profile} onUpdate={update} />
            </div>
          </section>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-6">
          <ProfileSectionCard
            icon={<Building2 className="size-5" />}
            title={t("profile.businessProfile")}
          >
            <CompanyFields
              profile={profile}
              onUpdate={update}
              userId={user.id}
              onSignatureChange={(url) => update("signatureUrl", url)}
            />
          </ProfileSectionCard>

          <ProfileSectionCard
            icon={<Landmark className="size-5" />}
            title={t("profile.financialInfo")}
            collapsible
            defaultOpen
          >
            <BankFields profile={profile} onUpdate={update} />
          </ProfileSectionCard>

          <div className="pt-2">
            {saveButton("w-full h-12")}
          </div>
        </div>

        {/* Desktop footer save bar */}
        <div className="hidden md:flex justify-end gap-3 pt-8 mt-2 border-t border-border">
          {saveButton("shadow-lg font-semibold gap-2 px-6")}
        </div>
        </main>
      </div>
    </div>
  );
}
