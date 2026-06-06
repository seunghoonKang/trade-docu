import type { User } from "@supabase/supabase-js";
import type { Seller } from "@/entities/seller/model";
import type { BankInfo } from "@/entities/bank-info/model";

export type SellerProfile = Omit<Seller, "id" | "userId"> & BankInfo;

const EMPTY_PROFILE: SellerProfile = {
  companyName: "",
  address: "",
  tel: "",
  fax: "",
  representative: "",
  signatureUrl: "",
  bankName: "",
  bankSwift: "",
  accountNo: "",
  accountee: "",
  bankAddress: "",
  bankTel: "",
  bankFax: "",
};

export function seedSellerFromMetadata(
  user: User | null,
  existing: (Seller & BankInfo) | null,
): SellerProfile {
  if (existing) {
    return {
      companyName: existing.companyName,
      address: existing.address,
      tel: existing.tel,
      fax: existing.fax,
      representative: existing.representative,
      signatureUrl: existing.signatureUrl,
      bankName: existing.bankName,
      bankSwift: existing.bankSwift,
      accountNo: existing.accountNo,
      accountee: existing.accountee,
      bankAddress: existing.bankAddress,
      bankTel: existing.bankTel,
      bankFax: existing.bankFax,
    };
  }

  const metadata = user?.user_metadata ?? {};
  return {
    ...EMPTY_PROFILE,
    representative:
      (metadata.name as string) ??
      (metadata.full_name as string) ??
      "",
    companyName: (metadata.company as string) ?? "",
  };
}
