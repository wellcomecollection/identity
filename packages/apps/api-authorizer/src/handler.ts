import Auth0Client, { Auth0UserInfo } from '@weco/auth0-client';
import { WrappedNodeRedisClient } from 'handy-redis';
import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import { APIResponse, ResponseStatus } from '@weco/identity-common';
import resourceAcls, {
  isAdministrator,
  ResourceAclMethod,
} from './resourceAcls';

export const createLambdaHandler = (
  auth0Client: Auth0Client,
  redisClient: WrappedNodeRedisClient
) => {
  async function cacheLookup(
    accessToken: string
  ): Promise<Auth0UserInfo | null> {
    const value = await redisClient.get(accessToken);
    if (value) {
      console.debug(
        `Cache hit for access token [${accessToken}] with value [${value}]`
      );
      return JSON.parse(value) as Auth0UserInfo;
    } else {
      console.debug(`Cache miss for access token [${accessToken}]`);
      return null;
    }
  }

  async function cacheInsert(
    accessToken: string,
    auth0UserInfo: Auth0UserInfo
  ): Promise<string | null> {
    const value: string = JSON.stringify(auth0UserInfo);
    const ttl: number = Number(process.env.REDIS_CACHE_TTL!);
    // 'EX' is the expiration (i.e. TTL) in seconds of the cache entry. We could also use 'PX' to provide the value in milliseconds.
    // AFAICT this is always 'OK' for a successful operation
    const result = await redisClient.set(accessToken, value, ['EX', ttl]);
    console.debug(
      `Cache put for access token [${accessToken}] with value [${value}]: [${result}]`
    );
    return value;
  }

  return async (
    event: APIGatewayRequestAuthorizerEvent
  ): Promise<APIGatewayAuthorizerResult> => {
    if (!event.headers?.Authorization) {
      console.debug('Authorization header is not present on request');
      return buildAuthorizerResult('user', 'Deny', event.methodArn);
    }

    // Start by extracting the access token from the 'Authorization' header.
    const authorizationHeader: string = event.headers.Authorization;
    const accessToken: string | null = extractAccessToken(authorizationHeader);
    if (!accessToken) {
      console.debug(
        `Authorization header [${authorizationHeader}] is not a valid bearer token`
      );
      return buildAuthorizerResult(
        authorizationHeader,
        'Deny',
        event.methodArn
      );
    }

    /*
     * 1. Using the given access token, query the Redis cache for an existing entry.
     * 2. If one is found, we assume the token is still valid and re-use the associated user information.
     * 3. Otherwise, query the Auth0 API to test for validity and fetch the corresponding user information.
     * 4. If the query was successful, store the user information in the Redis cache keyed against the access token.
     *
     * When the entry is inserted into the cache, it has a TTL defined by 'REDIS_CACHE_TTL'. Essentially, this value
     * represents the maximum amount of time (in seconds) that a token can be expired / revoked by Auth0 before we detect
     * that in this Lambda Function.
     */
    let auth0UserInfo: Auth0UserInfo | null = await cacheLookup(accessToken);
    if (!auth0UserInfo) {
      const auth0Validate: APIResponse<Auth0UserInfo> = await auth0Client.validateAccessToken(
        accessToken
      );
      if (auth0Validate.status !== ResponseStatus.Success) {
        if (auth0Validate.status === ResponseStatus.InvalidCredentials) {
          console.debug(
            `Access token [${accessToken}] rejected by Auth0: ${auth0Validate.message}`
          );
          return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
        } else {
          console.error(
            `Unknown error processing access token [${accessToken}]: ${auth0Validate.message}`
          );
          return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
        }
      }
      auth0UserInfo = auth0Validate.result;
      await cacheInsert(accessToken, auth0UserInfo);
    }

    // At this point, we have a valid access token and have a handle on the caller user information. Now we determine if
    // the user has access to the resource they are operating on.
    if (
      !validateRequest(
        auth0UserInfo,
        event.resource,
        <ResourceAclMethod>event.httpMethod,
        event.pathParameters
      )
    ) {
      console.debug(
        `Access token [${accessToken}] for user [${JSON.stringify(
          auth0UserInfo
        )}]` +
          `cannot operate on [${event.httpMethod} ${event.resource}] with path parameters [${event.pathParameters}]`
      );
      return buildAuthorizerResult(
        auth0UserInfo.userId,
        'Deny',
        event.methodArn
      );
    }

    return buildAuthorizerResult(
      auth0UserInfo.userId,
      'Allow',
      event.methodArn,
      auth0UserInfo.userId,
      isAdministrator(auth0UserInfo, {})
    );
  };
};

function extractAccessToken(tokenString: string): null | string {
  const match = tokenString.match(/^Bearer (.*)$/);
  return !match || match.length < 2 ? null : match[1];
}

function validateRequest(
  auth0UserInfo: Auth0UserInfo,
  resource: string,
  method: ResourceAclMethod,
  pathParameters: Record<string, string | undefined> | null
): boolean {
  const check = resourceAcls[resource]?.[method];
  if (!check) {
    // No ACL found, defensively deny access
    return false;
  }
  return check(auth0UserInfo, pathParameters);
}

function buildAuthorizerResult(
  principal: string,
  effect: 'Allow' | 'Deny',
  methodArn: string,
  callerId: string | undefined = undefined,
  isAdmin: boolean = false
): APIGatewayAuthorizerResult {
  return {
    context: {
      callerId,
      isAdmin,
    },
    principalId: principal,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn,
        },
      ],
    },
  };
}
