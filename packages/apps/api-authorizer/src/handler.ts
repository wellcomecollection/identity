import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import { TokenValidator } from './authentication';
import { authorizerResult, policyDocument, send401 } from './api-gateway';
import {
  allOf,
  hasScopes,
  isSelf,
  resourceAuthorizationValidator,
} from './authorization';

const validateRequest = resourceAuthorizationValidator({
  '/users/{userId}': {
    GET: allOf(isSelf, hasScopes('read:patron')),
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
  const validatedToken = await validateToken(token).catch(send401);

  // 3. Check the required scopes are present per-route
  const requestIsAllowed = validateRequest({
    path: event.resource,
    method: event.httpMethod,
    token: validatedToken,
    parameters: event.pathParameters || undefined,
  });

  // 4. Return the appropriate result
  const authorizerResultEffect = requestIsAllowed ? 'Allow' : 'Deny';
  return authorizerResult({
    policyDocument: policyDocument({
      effect: authorizerResultEffect,
      resource: event.methodArn,
    }),
    principalId: validatedToken.payload.sub || '',
  });
};
