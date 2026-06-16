/// <reference types="vitest/config" />
import path from "path";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fetchCustomsFxRates } from "./api/_customsFx";

/**
 * dev 전용 플러그인 — `vite dev`에서 `/api/customs-fx`를 Vercel 함수와 동일하게 제공한다.
 * 덕분에 Vercel CLI 없이 `pnpm dev`만으로 환율 도구를 end-to-end 테스트할 수 있다.
 */
function customsFxDevApi(env: Record<string, string>): PluginOption {
  return {
    name: "customs-fx-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/customs-fx", async (req, res) => {
        const original = (req as { originalUrl?: string }).originalUrl ?? req.url ?? "";
        const url = new URL(original, "http://localhost");
        const type = url.searchParams.get("type") === "import" ? "import" : "export";
        const date = url.searchParams.get("date") ?? undefined;
        try {
          const data = await fetchCustomsFxRates({ date, type, apiKey: env.DATA_GO_KR_SERVICE_KEY });
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(data));
        } catch {
          res.statusCode = 502;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "fx_failed" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), customsFxDevApi(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: [],
      exclude: ["e2e/**", "node_modules/**"],
    },
  };
});
