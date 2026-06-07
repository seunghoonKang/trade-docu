import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/app/layouts/AppLayout";
import { HistoryPage } from "@/pages/HistoryPage";
import { InvoiceDetailPage } from "@/pages/InvoiceDetailPage";
import { InvoicePage } from "@/pages/InvoicePage";
import { LoginPage } from "@/pages/LoginPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
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
        <Route path="/" element={<InvoicePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:invoiceId" element={<InvoiceDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>
    </Routes>
  );
}
