import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Thin, single-consumer slices are an intentional trade-off in this
      // single-domain app; we don't force merges. See docs/plan.
      "fsd/insignificant-slice": "off",
    },
  },
]);
