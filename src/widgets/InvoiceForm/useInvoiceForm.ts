import { useState, useCallback } from "react";
import type { Invoice, InvoiceItem, AdditionalCharge } from "../../entities/invoice/model";
import { createEmptyInvoice, createEmptyItem } from "../../entities/invoice/model";
import { calcItemAmount, calcTotalAmount } from "../../entities/invoice/lib";

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
    setForm((prev) => ({ ...prev, additionalCharges: [...prev.additionalCharges, { description: "", amount: 0 }] }));
  }, []);

  const removeCharge = useCallback((index: number) => {
    setForm((prev) => {
      const charges = prev.additionalCharges.filter((_, i) => i !== index);
      const totalAmount = calcTotalAmount(prev.items, charges);
      return { ...prev, additionalCharges: charges, totalAmount };
    });
  }, []);

  const loadForm = useCallback((data: InvoiceForm) => {
    setForm(data);
  }, []);

  return { form, updateField, updateBuyer, updateBankInfo, updateItem, addItem, removeItem, updateCharge, addCharge, removeCharge, loadForm };
}
