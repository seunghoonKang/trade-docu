import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/shared/ui";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  );
}
