module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off", // Allow console in blockchain projects
    "semi": ["error", "always"],
    "no-undef": "off", // Allow globals like 'task' in hardhat
  },
  ignorePatterns: [
    "node_modules/",
    "artifacts/",
    "cache/",
    "coverage/",
    "typechain/",
    "dist/",
    "backend/",
    "frontend/",
    "**/*.json",
    "**/*.ts",
  ],
};
