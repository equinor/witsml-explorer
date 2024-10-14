const eslint = require("@eslint/js");
const tsEslint = require("typescript-eslint");
const globals = require("globals");
const tsEslintParser = require("@typescript-eslint/parser");
const tsEslintPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");

module.exports = tsEslint.config(
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
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      "react": reactPlugin
    },
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "no-unused-vars": "off", //we want to ignore this and handle unused vars by @typescript-eslint plugin rule
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/prop-types": 1,
      "no-empty-pattern": "off"
    }
  },
  // standalone global ignores config due to default behaviour of minimal matching strategy
  {
    ignores: [
      "**/*.config.js",
      "**/*.config.ts",
      "node_modules",
      "**/bin",
      "**/.idea",
      "**/dist",
      "**/out",
      "**/obj"
    ]
  }
);
