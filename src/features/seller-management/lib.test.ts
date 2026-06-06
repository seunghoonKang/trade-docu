import { describe, it, expect } from "vitest";
import type { User } from "@supabase/supabase-js";
import { seedSellerFromMetadata } from "./lib";
import type { Seller } from "@/entities/seller/model";
import type { BankInfo } from "@/entities/bank-info/model";

function makeUser(metadata: Record<string, unknown>): User {
  return { user_metadata: metadata } as unknown as User;
}

const existing: Seller & BankInfo = {
  id: "row-1",
  userId: "user-1",
  companyName: "Upsight Co.",
  address: "Seoul",
  tel: "02-111-2222",
  fax: "02-111-3333",
  representative: "Hong Gildong",
  signatureUrl: "https://example.com/signature.png",
  bankName: "KB",
  bankSwift: "CZNBKRSE",
  accountNo: "123-456",
  accountee: "Upsight Co.",
  bankAddress: "Seoul",
  bankTel: "02-999-0000",
  bankFax: "02-999-0001",
};

describe("seedSellerFromMetadata", () => {
  it("returns the existing seller row values and ignores metadata", () => {
    const result = seedSellerFromMetadata(
      makeUser({ name: "Someone Else", company: "Other Corp" }),
      existing,
    );
    expect(result).toEqual({
      companyName: "Upsight Co.",
      address: "Seoul",
      tel: "02-111-2222",
      fax: "02-111-3333",
      representative: "Hong Gildong",
      signatureUrl: "https://example.com/signature.png",
      bankName: "KB",
      bankSwift: "CZNBKRSE",
      accountNo: "123-456",
      accountee: "Upsight Co.",
      bankAddress: "Seoul",
      bankTel: "02-999-0000",
      bankFax: "02-999-0001",
    });
  });

  it("seeds representative from name and companyName from company when no row exists", () => {
    const result = seedSellerFromMetadata(
      makeUser({ name: "Hong Gildong", company: "Upsight Co." }),
      null,
    );
    expect(result.representative).toBe("Hong Gildong");
    expect(result.companyName).toBe("Upsight Co.");
    expect(result.address).toBe("");
    expect(result.tel).toBe("");
    expect(result.bankName).toBe("");
    expect(result.accountNo).toBe("");
  });

  it("treats a null/missing company as an empty companyName (company is optional at signup)", () => {
    const nullCompany = seedSellerFromMetadata(
      makeUser({ name: "Hong Gildong", company: null }),
      null,
    );
    expect(nullCompany.companyName).toBe("");
    expect(nullCompany.representative).toBe("Hong Gildong");

    const missingCompany = seedSellerFromMetadata(makeUser({ name: "Hong Gildong" }), null);
    expect(missingCompany.companyName).toBe("");
  });

  it("returns an all-empty profile when there is no user and no row", () => {
    expect(seedSellerFromMetadata(null, null)).toEqual({
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
    });
  });
});
