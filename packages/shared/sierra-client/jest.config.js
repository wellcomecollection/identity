const base = require('../../../jest.config.base.js');

module.exports = {
  ...base,
  name: '@weco/sierra-client',
  displayName: 'Sierra Client',
  setupFilesAfterEnv: ['jest-extended/all'],
};
