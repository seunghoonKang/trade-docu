import { supabase } from "../../shared/lib/supabase";
import type { Seller } from "../../entities/seller/model";
import type { BankInfo } from "../../entities/bank-info/model";

export async function getSeller(userId: string): Promise<(Seller & BankInfo) | null> {
  const { data, error } = await supabase
    .from("sellers").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id, userId: data.user_id,
    companyName: data.company_name, address: data.address,
    tel: data.tel, fax: data.fax, representative: data.representative,
    bankName: data.bank_name, bankSwift: data.bank_swift,
    accountNo: data.account_no, accountee: data.accountee,
    bankAddress: data.bank_address, bankTel: data.bank_tel, bankFax: data.bank_fax,
  };
}

export async function upsertSeller(userId: string, seller: Omit<Seller, "id" | "userId">, bank: BankInfo) {
  const { error } = await supabase.from("sellers").upsert({
    user_id: userId,
    company_name: seller.companyName, address: seller.address,
    tel: seller.tel, fax: seller.fax, representative: seller.representative,
    bank_name: bank.bankName, bank_swift: bank.bankSwift,
    account_no: bank.accountNo, accountee: bank.accountee,
    bank_address: bank.bankAddress, bank_tel: bank.bankTel, bank_fax: bank.bankFax,
  }, { onConflict: "user_id" });
  if (error) throw error;
}
