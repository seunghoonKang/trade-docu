import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input, FormSection } from "@/shared/ui";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  getSeller,
  upsertSeller,
  seedSellerFromMetadata,
  type SellerProfile,
} from "@/features/seller-management";

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    getSeller(user.id).then((seller) => {
      setProfile(seedSellerFromMetadata(user, seller));
    });
  }, [user, loading, navigate]);

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

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          {t("profile.back")}
        </Button>
        <h1 className="text-lg font-bold text-gray-900">{t("profile.title")}</h1>
        <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving}>
          {t("profile.save")}
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">{t("profile.subtitle")}</p>

        <FormSection title={t("profile.companyInfo")}>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("form.companyName")} value={profile.companyName} onChange={(e) => update("companyName", e.target.value)} />
            <Input label={t("form.representative")} value={profile.representative} onChange={(e) => update("representative", e.target.value)} />
            <Input label={t("form.address")} value={profile.address} onChange={(e) => update("address", e.target.value)} className="col-span-2" />
            <Input label={t("form.tel")} value={profile.tel} onChange={(e) => update("tel", e.target.value)} />
            <Input label={t("form.fax")} value={profile.fax} onChange={(e) => update("fax", e.target.value)} />
          </div>
        </FormSection>

        <FormSection title={t("form.bankInfo")}>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t("form.bankName")} value={profile.bankName} onChange={(e) => update("bankName", e.target.value)} />
            <Input label={t("form.bankSwift")} value={profile.bankSwift} onChange={(e) => update("bankSwift", e.target.value)} />
            <Input label={t("form.accountNo")} value={profile.accountNo} onChange={(e) => update("accountNo", e.target.value)} />
            <Input label={t("form.accountee")} value={profile.accountee} onChange={(e) => update("accountee", e.target.value)} />
            <Input label={t("form.bankAddress")} value={profile.bankAddress} onChange={(e) => update("bankAddress", e.target.value)} className="col-span-2" />
            <Input label={t("form.bankTel")} value={profile.bankTel} onChange={(e) => update("bankTel", e.target.value)} />
            <Input label={t("form.bankFax")} value={profile.bankFax} onChange={(e) => update("bankFax", e.target.value)} />
          </div>
        </FormSection>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving}>
            {t("profile.save")}
          </Button>
        </div>
      </main>
    </div>
  );
}
