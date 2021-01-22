module.exports = {
  overrides: [
    {
      files: ['*.spec.ts'],
      plugins: ['@typescript-eslint', 'prettier', 'json-format', 'cypress'],
      rules: {
        'no-unused-expressions': 0,
      },
    },
  ],
};
