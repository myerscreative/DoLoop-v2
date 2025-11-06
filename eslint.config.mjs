import { defineConfig } from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      ".next/**",
      "dist/**",
      "**/*.config.js",
      "**/*.config.ts",
      // Ignore all old Next.js files
      "src/app/**",
      "src/components/layout/**",
      "src/components/loops/**",
      "src/components/ui/**",
      "postcss.config.mjs",
      "next.config.ts",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // JavaScript rules
      "no-console": "warn",
      "no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
