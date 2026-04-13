import { supabase } from "../../shared/lib/supabase";
import type { Product } from "../../entities/product/model";

export async function listProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id, userId: row.user_id,
    description: row.description, hsCode: row.hs_code,
    unit: row.unit, unitPrice: Number(row.unit_price), remarks: row.remarks,
  }));
}

export async function createProduct(userId: string, product: Omit<Product, "id" | "userId">) {
  const { error } = await supabase.from("products").insert({
    user_id: userId, description: product.description,
    hs_code: product.hsCode, unit: product.unit,
    unit_price: product.unitPrice, remarks: product.remarks,
  });
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
