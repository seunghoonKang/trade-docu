import { supabase } from "@/shared/lib/supabase";
import type { Buyer } from "@/entities/buyer";

export interface BuyerInput {
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
}

function mapRow(row: Record<string, string | null>): Buyer {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    companyName: row.company_name ?? "",
    address: row.address ?? "",
    tel: row.tel ?? "",
    contactPerson: row.contact_person ?? "",
    createdAt: row.created_at as string,
    lastUsedAt: row.last_used_at ?? null,
  };
}

export async function listBuyers(userId: string): Promise<Buyer[]> {
  const { data, error } = await supabase
    .from("buyers").select("*").eq("user_id", userId)
    .order("last_used_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createBuyer(userId: string, buyer: BuyerInput): Promise<Buyer> {
  const { data, error } = await supabase.from("buyers").insert({
    user_id: userId, company_name: buyer.companyName,
    address: buyer.address, tel: buyer.tel, contact_person: buyer.contactPerson,
  }).select().single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateBuyer(id: string, buyer: BuyerInput): Promise<Buyer> {
  const { data, error } = await supabase.from("buyers").update({
    company_name: buyer.companyName,
    address: buyer.address, tel: buyer.tel, contact_person: buyer.contactPerson,
  }).eq("id", id).select().single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteBuyer(id: string) {
  const { error } = await supabase.from("buyers").delete().eq("id", id);
  if (error) throw error;
}

/** picker에서 거래처를 선택한 순간 호출 — 최근 사용순 정렬의 기준(#49). */
export async function touchBuyerLastUsed(id: string) {
  const { error } = await supabase
    .from("buyers").update({ last_used_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
