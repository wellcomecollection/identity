// This replicates (some of) the globals that are available in
// an Auth0 script environment

global.configuration = {
  API_ROOT: 'test_api_host',
  CLIENT_KEY: 'test_client_key',
  CLIENT_SECRET: 'test_client_secret',
};

class WrongUsernameOrPasswordError extends Error {
  constructor(emailOrId, message) {
    super(message);
  }
}

global.WrongUsernameOrPasswordError = WrongUsernameOrPasswordError;
