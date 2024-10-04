import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import globals from "globals";
import tsEslintParser from "@typescript-eslint/parser";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import vitestPlugin from "eslint-plugin-vitest";
import jestPlugin from "eslint-plugin-jest";

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    settings: {
      react: {
        version: "detect"
      }
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsEslintParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        React: "readonly",
        HeadersInit: "readonly",
        RequestInit: "readonly",
        NodeJS: "readonly",
        JSX: "readonly",
        vi: "readonly"
      }
    },
    files: ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
    ignores: [
      "**/*.config.js",
      "**/*.config.ts",
      "node_modules/*",
      "bin/*",
      ".idea/*",
      "dist/*",
      "out/*"
    ],
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      "react": reactPlugin,
      "vitest": vitestPlugin,
      "jest": jestPlugin
    },
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-vars": "off", //we want to ignore this and handle unused vars by @typescript-eslint plugin rule
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/prop-types": 1,
      "no-empty-pattern": "off"
    }
  }
);
