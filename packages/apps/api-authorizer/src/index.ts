import Auth0Client from '@weco/auth0-client';
import { Auth0UserInfo, toAuth0UserInfo } from '@weco/auth0-client/lib/auth0';
import { APIResponse, ResponseStatus } from '@weco/identity-common';
import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import { RedisClient } from "redis";
import { promisify } from "util";

export async function lambdaHandler(event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {

  const auth0Client: Auth0Client = new Auth0Client(
    process.env.AUTH0_API_ROOT!, process.env.AUTH0_API_AUDIENCE!, process.env.AUTH0_CLIENT_ID!, process.env.AUTH0_CLIENT_SECRET!
  );

  const redisClient: RedisClient = new RedisClient({
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!)
  });
  const redisGet: (key: string) => Promise<Auth0UserInfo | null> = <(key: string) => Promise<Auth0UserInfo | null>>promisify(redisClient.get).bind(redisClient);
  const redisSet: (key: string, value: string, mode: string, duration: number) => Promise<'OK' | undefined> = <(key: string, value: string, mode: string, duration: number) => Promise<'OK' | undefined>>promisify(redisClient.set).bind(redisClient);

  if (!event.headers?.Authorization) {
    console.log('Authorization header is not present on request');
    return buildAuthorizerResult('user', 'Deny', event.methodArn);
  }

  const authorizationHeader: string = event.headers.Authorization;
  const accessToken: string | null = extractAccessToken(authorizationHeader);
  if (!accessToken) {
    console.log('Authorization header [' + authorizationHeader + '] is not a valid bearer token');
    return buildAuthorizerResult(authorizationHeader, 'Deny', event.methodArn);
  }

  let auth0UserInfo: Auth0UserInfo | null = await redisGet(accessToken).then(data => {
    if (data) {
      console.log('Cache hit for access token [' + accessToken + ']: [' + data + ']');
      return data;
    } else {
      return null;
    }
  });

  if (!auth0UserInfo) {
    console.log('Cache miss for access token [' + accessToken + ']');

    const auth0Validate: APIResponse<Auth0UserInfo> = await auth0Client.validateAccessToken(accessToken);
    if (auth0Validate.status !== ResponseStatus.Success) {
      if (auth0Validate.status === ResponseStatus.InvalidCredentials) {
        console.log('Access token token [' + accessToken + '] rejected by Auth0: ' + auth0Validate.message);
        return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
      } else {
        console.log('Unknown error processing access token [' + accessToken + ']: ' + auth0Validate.message);
        return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
      }
    }

    auth0UserInfo = auth0Validate.result;
    console.log('Cache set for access token [' + accessToken + ']: [' + JSON.stringify(auth0UserInfo) + ']');
    await redisSet(accessToken, JSON.stringify(auth0UserInfo), 'EX', 60);
  }

  if (!validateRequest(auth0UserInfo, event.resource, <ResourceAclMethod>event.httpMethod, event.pathParameters)) {
    console.log('Access token [' + accessToken + '] for user [' + JSON.stringify(auth0UserInfo) + '] cannot operate on [' + event.httpMethod + ' ' + event.resource + '] with path parameters [' + event.pathParameters + ']');
    return buildAuthorizerResult(auth0UserInfo.userId, 'Deny', event.methodArn);
  }

  return buildAuthorizerResult(auth0UserInfo.userId, 'Allow', event.methodArn, auth0UserInfo.userId, isAdministrator(auth0UserInfo, {}));
}

function extractAccessToken(tokenString: string): null | string {
  const match = tokenString.match(/^Bearer (.*)$/);
  return !match || match.length < 2 ? null : match[1];
}

function validateRequest(auth0UserInfo: Auth0UserInfo, resource: string, method: ResourceAclMethod, pathParameters: Record<string, string | undefined> | null): boolean {
  let acl: ResourceAcl | undefined = resourceAcls.find(acl => acl.resource === resource && acl.methods.includes(method));
  if (!acl) {
    // No ACL found, defensively deny access
    return false;
  }

  let aclCheckType: ResourceAclCheckType = acl.checkType ?? 'OR';

  // Start with the ACL flag by default set to the following
  //   AND: a successful match will keep the flag on, an unsuccessful match will turn it off
  //   OR: a successful match will OR the flag on, an unsuccessful match will leave it as is.
  let aclMatched: boolean = aclCheckType === 'AND';

  let aclChecks: ResourceAclCheck[] = Array.isArray(acl.check) ? acl.check : [acl.check];

  for (const check of aclChecks) {
    let matched: boolean = check(auth0UserInfo, pathParameters);
    if (aclCheckType === 'OR') {
      aclMatched = aclMatched || matched;
    } else if (aclCheckType === 'AND') {
      aclMatched = aclMatched && matched;
    }
  }

  return aclMatched;
}

function buildAuthorizerResult(principal: string, effect: string, methodArn: string, callerId: string | undefined = undefined, isAdmin: boolean = false): APIGatewayAuthorizerResult {
  return {
    context: {
      callerId,
      isAdmin
    },
    principalId: principal,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn
        }
      ]
    }
  }
}

type ResourceAclMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ResourceAclCheckType = 'AND' | 'OR';
type ResourceAclCheck = (user: Auth0UserInfo, pathParameters: Record<string, string | undefined> | null) => boolean;

type ResourceAcl = {
  resource: string,
  methods: ResourceAclMethod[],
  check: ResourceAclCheck | Array<ResourceAclCheck>,
  checkType?: ResourceAclCheckType
};

const isAdministrator = function (user: Auth0UserInfo, pathParameters: Record<string, string | undefined> | null): boolean {
  // @ts-ignore is_admin isn't typed on additionalAttributes
  return user.additionalAttributes?.is_admin ?? false;
};

const isSelf = function (user: Auth0UserInfo, pathParameters: Record<string, string | undefined> | null): boolean {
  return pathParameters?.userId === 'me' || pathParameters?.userId === user.userId.toString();
};

const resourceAcls: ResourceAcl[] = [
  {
    resource: '/users',
    methods: ['GET'],
    check: isAdministrator
  },
  {
    resource: '/users/{userId}',
    methods: ['GET', 'PUT'],
    check: [isSelf, isAdministrator],
    checkType: 'OR'
  },
  {
    resource: '/users/{userId}',
    methods: ['DELETE'],
    check: isAdministrator
  },
  {
    resource: '/users/{userId}/password',
    methods: ['PUT'],
    check: [isSelf, isAdministrator],
    checkType: 'OR'
  },
  {
    resource: '/users/{userId}/send-verification',
    methods: ['PUT'],
    check: [isSelf, isAdministrator],
  },
  {
    resource: '/users/{userId}/lock',
    methods: ['PUT'],
    check: isAdministrator,
  },
  {
    resource: '/users/{userId}/unlock',
    methods: ['PUT'],
    check: isAdministrator,
  },
  {
    resource: '/users/{userId}/deletion-request',
    methods: ['PUT'],
    check: isSelf,
  },
  {
    resource: '/users/{userId}/deletion-request',
    methods: ['DELETE'],
    check: isAdministrator,
  },
  {
    resource: '/users/{userId}/validate',
    methods: ['POST'],
    check: isSelf,
  },
];
