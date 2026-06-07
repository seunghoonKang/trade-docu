import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/shared/ui";
import { ServiceGuideProvider } from "@/features/service-guide";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ServiceGuideProvider>{children}</ServiceGuideProvider>
      </AuthProvider>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  );
}
