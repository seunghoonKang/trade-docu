import { Providers } from "./providers";
import { AppRouter } from "./router";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <Providers>
      <AppRouter />
      <Analytics />
    </Providers>
  );
}
