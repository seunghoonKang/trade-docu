import type { BankInfo } from "@/shared/lib/bankInfo";

export interface Seller {
  id: string;
  userId: string;
  companyName: string;
  address: string;
  tel: string;
  fax: string;
  representative: string;
  signatureUrl: string;
}

export type SellerProfile = Omit<Seller, "id" | "userId"> & BankInfo;
