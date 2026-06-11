import { useState, useCallback } from "react";
import type { Invoice, InvoiceItem, AdditionalCharge, BuyerSnapshot, LcInfoForm } from "@/entities/invoice";
import { createEmptyInvoice, createEmptyItem, createEmptyParty } from "@/entities/invoice";
import { calcItemAmount, calcTotalAmount } from "@/entities/invoice";
import { createSeparatedParty } from "./partyMirror";

type PartyKind = "consignee" | "notify";

type InvoiceForm = Omit<Invoice, "id" | "userId" | "createdAt">;

export function useInvoiceForm() {
  const [form, setForm] = useState<InvoiceForm>(createEmptyInvoice());

  const updateField = useCallback(<K extends keyof InvoiceForm>(key: K, value: InvoiceForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateBuyer = useCallback(<K extends keyof InvoiceForm["buyerSnapshot"]>(key: K, value: InvoiceForm["buyerSnapshot"][K]) => {
    setForm((prev) => ({ ...prev, buyerSnapshot: { ...prev.buyerSnapshot, [key]: value } }));
  }, []);

  const updateBankInfo = useCallback(<K extends keyof InvoiceForm["bankInfo"]>(key: K, value: InvoiceForm["bankInfo"][K]) => {
    setForm((prev) => ({ ...prev, bankInfo: { ...prev.bankInfo, [key]: value } }));
  }, []);

  // 당사자(수하인/착하통지처): null = 구매자와 동일. 분리 시 구매자 값 복사로 시작(#49).
  const toggleParty = useCallback((party: PartyKind, separate: boolean) => {
    setForm((prev) => ({ ...prev, [party]: separate ? createSeparatedParty(prev.buyerSnapshot) : null }));
  }, []);

  const updateParty = useCallback((party: PartyKind, key: keyof BuyerSnapshot, value: string) => {
    setForm((prev) => ({ ...prev, [party]: { ...(prev[party] ?? createEmptyParty()), [key]: value } }));
  }, []);

  const updateLcInfo = useCallback((key: keyof LcInfoForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      lcInfo: { ...(prev.lcInfo ?? { no: "", issuingBank: "", date: "" }), [key]: value },
    }));
  }, []);

  const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.items];
      const item = { ...items[index], [field]: value };
      if (field === "qty" || field === "unitPrice") {
        item.amount = calcItemAmount(
          field === "qty" ? (value as number) : item.qty,
          field === "unitPrice" ? (value as number) : item.unitPrice
        );
      }
      items[index] = item;
      const totalAmount = calcTotalAmount(items, prev.additionalCharges);
      return { ...prev, items, totalAmount };
    });
  }, []);

  const addItem = useCallback(() => {
    setForm((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      const totalAmount = calcTotalAmount(items, prev.additionalCharges);
      return { ...prev, items, totalAmount };
    });
  }, []);

  const updateCharge = useCallback((index: number, field: keyof AdditionalCharge, value: string | number) => {
    setForm((prev) => {
      const charges = [...prev.additionalCharges];
      charges[index] = { ...charges[index], [field]: value };
      const totalAmount = calcTotalAmount(prev.items, charges);
      return { ...prev, additionalCharges: charges, totalAmount };
    });
  }, []);

  const addCharge = useCallback(() => {
    setForm((prev) => ({ ...prev, additionalCharges: [...prev.additionalCharges, { type: "other", description: "", amount: 0 }] }));
  }, []);

  const removeCharge = useCallback((index: number) => {
    setForm((prev) => {
      const charges = prev.additionalCharges.filter((_, i) => i !== index);
      const totalAmount = calcTotalAmount(prev.items, charges);
      return { ...prev, additionalCharges: charges, totalAmount };
    });
  }, []);

  const loadForm = useCallback((data: InvoiceForm) => {
    setForm({
      ...createEmptyInvoice(),
      ...data,
      sellerSignatureUrl: data.sellerSignatureUrl ?? "",
    });
  }, []);

  return { form, updateField, updateBuyer, updateBankInfo, toggleParty, updateParty, updateLcInfo, updateItem, addItem, removeItem, updateCharge, addCharge, removeCharge, loadForm };
}
