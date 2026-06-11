import js from "@eslint/js";
import globals from "globals";
import checkFile from "eslint-plugin-check-file";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  // 파일 네이밍 컨벤션 — shared/ui는 shadcn 컨벤션(kebab), 그 외 컴포넌트는
  // PascalCase, lib 모듈은 camelCase. ignoreMiddleExtensions: *.test.tsx 허용.
  {
    files: ["src/**/*"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "src/shared/ui/**/*.{ts,tsx}": "KEBAB_CASE",
          "src/pages/**/*.tsx": "PASCAL_CASE",
          "src/widgets/**/ui/**/*.tsx": "PASCAL_CASE",
          "src/features/**/ui/**/*.tsx": "PASCAL_CASE",
          "src/**/lib/**/*.{ts,tsx}": "CAMEL_CASE",
        },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
);
