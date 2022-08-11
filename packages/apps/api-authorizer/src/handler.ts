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
import { JsonWebTokenError, Jwt } from 'jsonwebtoken';

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
  '/users/{userId}/resend_verification': {
    POST: isSelf,
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

/** The principal ID is used by the identity API as an extra belt-and-braces
 * check on authorisation.
 *
 * e.g. if it gets a principal ID for user 123 but the operation is affecting
 * user 456, then we know shenanigans are occurring!
 *
 */
export const choosePrincipalId = (validatedToken: Jwt): string => {
  const tokenSubject =
    typeof validatedToken.payload === 'string'
      ? undefined
      : validatedToken.payload.sub;

  // When we're acting on behalf of a user, the principal ID is a patron ID,
  // e.g. p1234567
  const patronId = auth0IdToPublic(tokenSubject);
  if (patronId) {
    return patronId;
  }

  // When this is a machine-to-machine flow, the principal ID is the static
  // string '@machine'.  We do have the client ID here, but currently we don't
  // have any restrictions on what machine clients can do.
  if (isMachineUser(validatedToken, {})) {
    return '@machine';
  }

  return tokenSubject || '';
};

export const createLambdaHandler =
  (validateToken: TokenValidator) =>
  async (
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

    return authorizerResult({
      policyDocument: policyDocument({
        effect: authorizerResultEffect,
        resource: event.methodArn,
      }),
      principalId: choosePrincipalId(validatedToken),
    });
  };
