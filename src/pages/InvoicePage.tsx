import { useEffect } from "react";
import { Layout } from "../shared/ui/Layout";
import { InvoiceForm } from "../widgets/InvoiceForm";
import { InvoicePreview } from "../widgets/InvoicePreview";
import { ExportToolbar } from "../widgets/ExportToolbar";
import { useInvoiceForm } from "../widgets/InvoiceForm/useInvoiceForm";
import { useAuth } from "../app/providers/AuthProvider";
import { getSeller } from "../features/seller-management/api";

export function InvoicePage() {
  const invoiceForm = useInvoiceForm();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getSeller(user.id).then((seller) => {
        if (seller) {
          invoiceForm.updateField("sellerCompanyName", seller.companyName);
          invoiceForm.updateField("sellerAddress", seller.address);
          invoiceForm.updateField("sellerTel", seller.tel);
          invoiceForm.updateField("sellerFax", seller.fax);
          invoiceForm.updateField("sellerRepresentative", seller.representative);
          invoiceForm.updateBankInfo("bankName", seller.bankName);
          invoiceForm.updateBankInfo("bankSwift", seller.bankSwift);
          invoiceForm.updateBankInfo("accountNo", seller.accountNo);
          invoiceForm.updateBankInfo("accountee", seller.accountee);
          invoiceForm.updateBankInfo("bankAddress", seller.bankAddress);
          invoiceForm.updateBankInfo("bankTel", seller.bankTel);
          invoiceForm.updateBankInfo("bankFax", seller.bankFax);
        }
      });
    }
  }, [user]);

  return (
    <Layout toolbar={<ExportToolbar formData={invoiceForm.form} />}>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
        <div className="w-full lg:w-1/2 overflow-y-auto border-r border-gray-200">
          <InvoiceForm {...invoiceForm} />
        </div>
        <div id="invoice-preview" className="hidden lg:block w-1/2 overflow-y-auto bg-gray-50 p-6">
          <InvoicePreview data={invoiceForm.form} />
        </div>
      </div>
    </Layout>
  );
}
