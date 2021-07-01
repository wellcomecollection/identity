const base = require('../../../jest.config.base.js');

module.exports = {
  ...base,
  name: '@weco/auth0-actions',
  displayName: 'Auth0 Actions',
  setupFiles: ['./jest.setup.js'],
  silent: false,
};
