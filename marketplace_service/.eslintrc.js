module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // Add specific ESLint rules here.
    // For example:
    // "indent": ["error", 2],
    // "quotes": ["error", "double"],
    // ...
  },
  overrides: [
    {
      files: ["api/v1/src/**/*.ts"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
      ],
      rules: {
        // Add TypeScript-specific ESLint rules here if needed.
        // For example:
        // "@typescript-eslint/explicit-function-return-type": "error",
      },
    },
  ],
};
