import { createLambdaHandler } from './handler';
import { createValidator } from './authentication';

const envConfig = {
  auth0Domain: process.env.AUTH0_DOMAIN!,
  identityApiId: process.env.IDENTITY_API_ID!,
};

Object.entries(envConfig).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Required config key [${key}] was missing!`);
  }
});

const tokenValidator = createValidator({
  // https://auth0.com/docs/security/tokens/json-web-tokens/json-web-key-sets
  jwksUri: `https://${envConfig.auth0Domain}/.well-known/jwks.json`,
  // https://auth0.com/docs/security/tokens/access-tokens/get-access-tokens#custom-domains-and-the-management-api
  tokenIssuer: envConfig.auth0Domain,
  resourceServerId: envConfig.identityApiId,
});

export const lambdaHandler = createLambdaHandler(tokenValidator);
