import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/shared/ui";
import { ServiceGuideProvider } from "@/features/service-guide";
import { SessionProvider } from "@/entities/session";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <SessionProvider>
        <ServiceGuideProvider>{children}</ServiceGuideProvider>
      </SessionProvider>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  );
}
