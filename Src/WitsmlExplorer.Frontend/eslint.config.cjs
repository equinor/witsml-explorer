let js = require("@eslint/js");
let globals = require("globals");
let typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
let typescriptEslintParser = require("@typescript-eslint/parser");
let reactEslintPlugin = require("eslint-plugin-react");
let prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    settings: {
      react: {
        version: "detect"
      }
    },
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2021,
      sourceType: "module",
      parser: typescriptEslintParser
      // Assuming globals is correctly imported above; otherwise, specify globals manually
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      "react": reactEslintPlugin
    },
    rules: {
      // suppress errors for missing 'import React' in files
      "react/react-in-jsx-scope": "off",
      // allow jsx syntax in js files (for next.js project)
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
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/prop-types": 1,
      "no-unused-vars": "off",
      "no-empty-pattern": "off"
    }
  }
];
