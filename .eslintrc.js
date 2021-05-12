module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },

  extends: ['@metamask/eslint-config', '@metamask/eslint-config-nodejs'],

  globals: {
    Atomics: 'readonly',
    Buffer: 'readonly',
    SharedArrayBuffer: 'readonly',
  },

  parserOptions: {
    ecmaVersion: 2018,
  },

  rules: {
    'node/no-sync': 'off',
  },

  ignorePatterns: ['!.eslintrc.js', 'dist/'],
};
