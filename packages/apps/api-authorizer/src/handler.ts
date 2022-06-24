import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import { auth0IdToPublic } from '@weco/auth0-client';
import { TokenValidator } from './authentication';
import { authorizerResult, policyDocument, send401 } from './api-gateway';
import {
  allOf,
  hasScopes,
  isMachineUser,
  isSelf,
  resourceAuthorizationValidator,
} from './authorization';
import { JsonWebTokenError } from 'jsonwebtoken';

// The presence of scope checking here is more about being descriptive than adding security,
// as the ability to enforce which scopes a user is allowed is an additional piece of work
// which we haven't completed.
//
// Refer to: https://auth0.com/docs/configure/apis/scopes/api-scopes#limit-api-scopes
// If we want to add different types of user and restrict permissions/scopes based on
// their roles, we will want to add RBAC with the Authorization Core:
// https://auth0.com/docs/authorization/rbac/
// https://auth0.com/docs/authorization/rbac/auth-core-features
const validateRequest = resourceAuthorizationValidator({
  '/users/{userId}': {
    GET: allOf(isSelf, hasScopes('read:user')),
    PUT: allOf(isSelf, hasScopes('update:email')),
  },
  '/users/{userId}/password': {
    PUT: allOf(isSelf, hasScopes('update:password')),
  },
  '/users/{userId}/deletion-request': {
    PUT: allOf(isSelf, hasScopes('delete:patron')),
  },
  '/users/{userId}/validate': {
    POST: isSelf,
  },
  '/users/{userId}/item-requests': {
    POST: allOf(isSelf, hasScopes('create:requests')),
    GET: allOf(isSelf, hasScopes('read:requests')),
  },
  '/users/{userId}/registration': {
    PUT: isMachineUser,
  },
});

export const createLambdaHandler = (validateToken: TokenValidator) => async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  // 1. Extract the token
  const authHeader = event.headers?.['Authorization'];
  const token = authHeader?.match(/^Bearer (.*)$/)?.[1];
  if (!token) {
    return send401();
  }

  // 2. Validate the token
  const validatedToken = await validateToken(token).catch((error) => {
    // These are 'interesting' JWT errors as opposed to routine expiries
    // They do not leak PII
    // See https://github.com/auth0/node-jsonwebtoken#jsonwebtokenerror
    if (error instanceof JsonWebTokenError) {
      console.error('Invalid token', error);
    }
    return send401();
  });

  // 3. Check the request against the rules defined above
  const requestIsAllowed = validateRequest({
    path: event.resource,
    method: event.httpMethod,
    token: validatedToken,
    parameters: event.pathParameters || undefined,
  });

  // 4. Return the appropriate result

  // I've written this like so because a ternary is not so readable and doesn't
  // really fulfill the desire of "deny by default" behaviour.
  let authorizerResultEffect: 'Deny' | 'Allow' = 'Deny';
  if (requestIsAllowed) {
    authorizerResultEffect = 'Allow';
  }
  const tokenSubject =
    typeof validatedToken.payload === 'string'
      ? undefined
      : validatedToken.payload.sub;

  return authorizerResult({
    policyDocument: policyDocument({
      effect: authorizerResultEffect,
      resource: event.methodArn,
    }),
    principalId: auth0IdToPublic(tokenSubject) || '',
  });
};
