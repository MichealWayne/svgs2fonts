/*
 * @author Wayne
 * @Date 2022-03-22 16:07:26
 * @LastEditTime 2022-10-11 11:06:57
 */
// document: https://eslint.org/docs/user-guide/configuring

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    camelcase: [0],
    'no-trailing-spaces': [0],
    'filenames/match-exported': [0],
    'no-multi-spaces': [0],
    indent: [0],
    'no-console': [0],
    'no-extra-parens': [0],
    'no-unused-vars': [
      2,
      {
        vars: 'local',
        args: 'none',
      },
    ],
    'no-magic-numbers': [0],
    'no-shadow': 'off',
    'line-comment-position': [0],
    'no-unused-vars': 'off',
  },
};
