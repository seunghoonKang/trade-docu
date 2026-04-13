import { Layout } from "../shared/ui/Layout";
import { InvoiceForm } from "../widgets/InvoiceForm";
import { InvoicePreview } from "../widgets/InvoicePreview";
import { ExportToolbar } from "../widgets/ExportToolbar";
import { useInvoiceForm } from "../widgets/InvoiceForm/useInvoiceForm";

export function InvoicePage() {
  const invoiceForm = useInvoiceForm();

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
