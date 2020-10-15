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
    '@typescript-eslint/indent': 0, // off because this package does not work
    'arrow-parens': 0,
    'comma-dangle': 0,
    'import/no-extraneous-dependencies': ['error', {'devDependencies': true}],
    'import/no-useless-path-segments': ['error', {
      noUselessIndex: true,
    }],
    'import/prefer-default-export': 0,
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': 'next' }],
    'space-before-function-paren': 0,
    radix: 0,
  },
};

