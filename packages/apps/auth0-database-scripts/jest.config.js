const base = require('../../../jest.config.base.js');

module.exports = {
  ...base,
  name: '@weco/auth0-database-scripts',
  displayName: 'Auth0 Database Scripts',
  setupFiles: ['./jest.setup.js'],
};
