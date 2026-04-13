import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../app/providers/AuthProvider";
import { listInvoices, deleteInvoice } from "../../features/invoice-crud/api";
import { Button } from "../../shared/ui/Button";
import type { Invoice } from "../../entities/invoice/model";

interface Props {
  onLoad: (invoice: Omit<Invoice, "id" | "userId" | "createdAt">) => void;
  onClose: () => void;
}

export function InvoiceHistory({ onLoad, onClose }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (user) { listInvoices(user.id).then(setInvoices); }
  }, [user]);

  async function handleDelete(id: string) {
    await deleteInvoice(id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }

  function handleLoad(inv: Invoice) {
    const { id, userId, createdAt, ...formData } = inv;
    onLoad(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-lg max-h-[70vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Invoice History</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-400">No saved invoices.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between border border-gray-100 rounded p-3">
                <div>
                  <p className="text-sm font-medium">{inv.invoiceNo || "No number"}</p>
                  <p className="text-xs text-gray-500">{inv.date} — {inv.buyerSnapshot.companyName || "No buyer"}</p>
                  <p className="text-xs text-gray-400">{inv.currency} {inv.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleLoad(inv)}>Load</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
