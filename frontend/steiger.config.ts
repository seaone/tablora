import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Allow Next.js App Router underscored FSD layers (_app, _pages)
      "fsd/typo-in-layer-name": "off",
      // Allow custom app segments (providers, styles)
      "fsd/segments-by-purpose": "off",
    },
  },
]);
