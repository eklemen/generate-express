module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript/base'
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': 0,
    'arrow-parens': 0,
    'comma-dangle': 0,
    'import/prefer-default-export': 0,
    'space-before-function-paren': 0,
    radix: 0,
  },
};

