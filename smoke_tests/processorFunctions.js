/*
This is an artillery.io processor
See: https://artillery.io/docs/guides/guides/http-reference.html#Loading-custom-JS-code

The functions in this file are available as hooks in the http request cycle, allowing
headers required for authentication to be inserted.
 */

const AWS = require('aws-sdk');
const request = require('request');

// These functions are available to use in the .yaml steps
module.exports = {
  addCredentials: addCredentials,
};

const stageSecrets = {
  auth0Domain: 'stage.account.wellcomecollection.org',
  apiKeySecretId: 'identity/stage/identity_web_app/api_key',
  credentialsSecretId: 'identity/stage/smoke_test/credentials',
};

const prodSecrets = {
  auth0Domain: 'account.wellcomecollection.org',
  apiKeySecretId: 'identity/prod/identity_web_app/api_key',
  credentialsSecretId: 'identity/prod/smoke_test/credentials',
};

const secretsManager = new AWS.SecretsManager();

// Convienience function for getting values from AWS SecretsManager
function getSecret(secretId, callback) {
  secretsManager.getSecretValue({ SecretId: secretId }, function (error, data) {
    if (error) {
      console.log(error, error.stack);
      process.exit(1);
    } else {
      callback(data['SecretString']);
    }
  });
}

// Implements the resource owner password OAuth flow via Auth0
function getAuthToken(secretId, auth0Domain, requestParams, callback) {
  const setCredentials = (credentials) => {
    const parsedCredentials = JSON.parse(credentials);
    const username = parsedCredentials['username'];
    const password = parsedCredentials['password'];
    const clientId = parsedCredentials['clientId'];
    const clientSecret = parsedCredentials['clientSecret'];

    const options = {
      method: 'POST',
      url: `https://${auth0Domain}/oauth/token`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {
        grant_type: 'password',
        username: username,
        password: password,
        client_id: clientId,
        client_secret: clientSecret,
        scope: [
          'openid',
          'create:requests',
          'delete:patron',
          'read:user',
          'read:requests',
          'update:email',
          'update:password',
        ].join(' '),
        audience: `https://v1-api.${auth0Domain}`,
      },
    };

    request(options, function (error, response, body) {
      if (error) {
        console.log(error, err.stack);
        process.exit(1);
      } else {
        const parsedBody = JSON.parse(body);
        const accessToken = parsedBody['access_token'];
        cachedAccessToken = accessToken;
        requestParams.headers['authorization'] = 'Bearer ' + accessToken;

        callback();
      }
    });
  };

  getSecret(secretId, setCredentials);
}

// Get the API key for API Gateway stored in SecretsManager
function getApiKey(secretId, requestParams, callback) {
  const setApiKey = (apiKey) => {
    cachedApiKey = apiKey;
    requestParams.headers['x-api-key'] = apiKey;
    callback();
  };

  getSecret(secretId, setApiKey);
}

// This function will retrieve credentials for accessing the Identity API
// An API key & Bearer token generated via an OAuth flow is required
function addCredentials(requestParams, context, ee, next) {
  let isStage = context['vars']['$environment'] === 'stage';
  const secrets = isStage ? stageSecrets : prodSecrets;

  const thenGetAuthToken = () =>
    getAuthToken(
      secrets.credentialsSecretId,
      secrets.auth0Domain,
      requestParams,
      next
    );
  const thenGetApiKey = () =>
    getApiKey(secrets.apiKeySecretId, requestParams, thenGetAuthToken);

  thenGetApiKey();
}
