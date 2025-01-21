module.exports = {
  root: true, // garante que esse é o arquivo raiz de configuração
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  env: {
    es2021: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    // Aqui você pode sobrescrever ou adicionar regras específicas
    // Exemplo: "semi": ["error", "always"]
  },
};
