import globals from "globals";
import eslint from "@eslint/js";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import vitestPlugin from "eslint-plugin-vitest";
import jestPlugin from "eslint-plugin-jest";

export default typescriptEslint.config(
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    settings: {
      react: {
        version: "detect"
      }
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parser: typescriptEslintParser
    },
    files: ["./**/*.js", "./**/*.ts", "./**/*.jsx", "./**/*.tsx"],
    ignores: [
      "**/*.config.js",
      "**/*.config.ts",
      "node_modules/*",
      "bin/*",
      ".idea/*"
    ],
    plugins: {
      react: reactPlugin,
      vitest: vitestPlugin,
      jest: jestPlugin
    },
    rules: {
      // suppress errors for missing 'import React' in files
      "react/react-in-jsx-scope": "off", // allow jsx syntax in js files (for next.js project)
      "react/jsx-filename-extension": [
        "warn",
        { extensions: [".js", ".jsx", ".ts", ".tsx"] }
      ],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/prop-types": 1,
      "no-unused-vars": "off",
      "no-empty-pattern": "off"
    }
  }
);
