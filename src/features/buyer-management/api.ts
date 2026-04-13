import { supabase } from "../../shared/lib/supabase";
import type { Buyer } from "../../entities/buyer/model";

export async function listBuyers(userId: string): Promise<Buyer[]> {
  const { data, error } = await supabase
    .from("buyers").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id, userId: row.user_id,
    companyName: row.company_name, address: row.address,
    tel: row.tel, contactPerson: row.contact_person,
  }));
}

export async function createBuyer(userId: string, buyer: Omit<Buyer, "id" | "userId">) {
  const { error } = await supabase.from("buyers").insert({
    user_id: userId, company_name: buyer.companyName,
    address: buyer.address, tel: buyer.tel, contact_person: buyer.contactPerson,
  });
  if (error) throw error;
}

export async function deleteBuyer(id: string) {
  const { error } = await supabase.from("buyers").delete().eq("id", id);
  if (error) throw error;
}
