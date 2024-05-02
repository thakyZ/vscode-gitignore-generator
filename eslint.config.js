// @ts-check

const eslint = require('@eslint/js');
const tsEslint = require('typescript-eslint');

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
);