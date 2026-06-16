import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/app/layouts/AppLayout";
import { BuyersPage } from "@/pages/BuyersPage";
import { DealDetailPage } from "@/pages/DealDetailPage";
import { DealDocumentPage } from "@/pages/DealDocumentPage";
import { DealIssuePage } from "@/pages/DealIssuePage";
import { HistoryPage } from "@/pages/HistoryPage";
import { HomePage } from "@/pages/HomePage";
import { InvoiceDetailPage } from "@/pages/InvoiceDetailPage";
import { InvoicePage } from "@/pages/InvoicePage";
import { LoginPage } from "@/pages/LoginPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PdfToExcelPage } from "@/pages/PdfToExcelPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { TermsPage } from "@/pages/TermsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<InvoicePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/buyers" element={<BuyersPage />} />
        <Route path="/tools/pdf-to-excel" element={<PdfToExcelPage />} />
        <Route path="/history/:invoiceId" element={<InvoiceDetailPage />} />
        <Route path="/deals/:dealId" element={<DealDetailPage />} />
        <Route path="/deals/:dealId/issue/:docType" element={<DealIssuePage />} />
        <Route path="/deals/:dealId/docs/:docId" element={<DealDocumentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>
    </Routes>
  );
}
