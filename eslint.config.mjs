import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/opengraph-image.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "worker-configuration.d.ts",
    ".wrangler/**",
    ".wrangler-dry-run/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
