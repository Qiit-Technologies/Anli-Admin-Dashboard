import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      // from main branch
      "@typescript-eslint/no-explicit-any": "off",
      // from feature/loyalty-admin branch
      "@next/next/no-img-element": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/immutability": "off",
      "react-hooks/gating": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/use-effect": "off",
      "react-hooks/use-callback": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
      "react/display-name": "off",
      "jsx-a11y/alt-text": "off",
    },
  },
];

export default eslintConfig;
