import { Routes, Route } from "react-router-dom";

function InvoicePageStub() {
  return <div>Invoice Page</div>;
}

function LoginPageStub() {
  return <div>Login Page</div>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InvoicePageStub />} />
      <Route path="/login" element={<LoginPageStub />} />
    </Routes>
  );
}
