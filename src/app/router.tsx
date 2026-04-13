import { Routes, Route } from "react-router-dom";
import { InvoicePage } from "../pages/InvoicePage";
import { LoginPage } from "../pages/LoginPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InvoicePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
