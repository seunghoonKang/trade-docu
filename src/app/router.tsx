import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";

function InvoicePageStub() {
  return <div>Invoice Page</div>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InvoicePageStub />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
