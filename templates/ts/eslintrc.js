module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'arrow-parens': 0,
    'comma-dangle': 0,
    'import/prefer-default-export': 0,
    'no-use-before-define': 0,
    'space-before-function-paren': 0,
    radix: 0,
  },
};
