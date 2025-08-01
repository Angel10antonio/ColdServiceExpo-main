import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactNative from 'eslint-plugin-react-native';
import eslintPluginPrettier from 'eslint-plugin-prettier';

/** @type {import("eslint").Linter.FlatConfig} */
export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: eslintPluginReact,
      'react-native': eslintPluginReactNative,
      prettier: eslintPluginPrettier,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
