import { Routes, Route } from "react-router-dom";
import { InvoicePage } from "@/pages/InvoicePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InvoicePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
