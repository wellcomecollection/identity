import Auth0Client from '@weco/auth0-client';
import { Auth0UserInfo } from '@weco/auth0-client/lib/auth0';
import { ResponseStatus } from '@weco/identity-common';
import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda';

export async function lambdaHandler(event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {

  const AUTH0_API_ROOT: string = process.env.AUTH0_API_ROOT!;
  const AUTH0_API_AUDIENCE: string = process.env.AUTH0_API_AUDIENCE!;
  const AUTH0_CLIENT_ID: string = process.env.AUTH0_CLIENT_ID!;
  const AUTH0_CLIENT_SECRET: string = process.env.AUTH0_CLIENT_SECRET!;

  const auth0Client = new Auth0Client(AUTH0_API_ROOT, AUTH0_API_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET);

  if (!event.headers?.Authorization) {
    console.log('Authorization header is not present on request');
    return buildAuthorizerResult('user', 'Deny', event.methodArn);
  }

  const authorizationHeader = event.headers.Authorization;
  const accessToken = extractAccessToken(authorizationHeader);
  if (!accessToken) {
    console.log('Authorization header [' + authorizationHeader + '] is not a valid bearer token');
    return buildAuthorizerResult(authorizationHeader, 'Deny', event.methodArn);
  }

  const auth0Validate = await auth0Client.validateAccessToken(accessToken);
  if (auth0Validate.status !== ResponseStatus.Success) {
    if (auth0Validate.status === ResponseStatus.InvalidCredentials) {
      console.log('Access token token [' + accessToken + '] rejected by Auth0: ' + auth0Validate.message);
      return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
    } else {
      console.log('Unknown error processing access token [' + accessToken + ']: ' + auth0Validate.message);
      return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
    }
  }

  if (!validateRequest(auth0Validate.result, event.resource, <ResourceAclMethod>event.httpMethod, event.pathParameters)) {
    console.log('Access token [' + accessToken + '] for user [' + JSON.stringify(auth0Validate.result) + '] cannot operate on [' + event.httpMethod + ' ' + event.resource + '] with path parameters [' + event.pathParameters + ']');
    return buildAuthorizerResult(auth0Validate.result.userId, 'Deny', event.methodArn);
  }


  return buildAuthorizerResult(auth0Validate.result.userId, 'Allow', event.methodArn, isAdministrator(auth0Validate.result, {}));
}

function extractAccessToken(tokenString: string): null | string {
  const match = tokenString.match(/^Bearer (.*)$/);
  return !match || match.length < 2 ? null : match[1];
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
  return pathParameters?.userId === user.userId.toString();
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
  }
];

function validateRequest(auth0UserInfo: Auth0UserInfo, resource: string, method: ResourceAclMethod, pathParameters: Record<string, string | undefined> | null): boolean {
  let acl = resourceAcls.find(acl => acl.resource === resource && acl.methods.includes(method));
  if (!acl) {
    // No ACL found, defensively deny access
    return false;
  }

  let aclCheckType = acl.checkType ?? 'OR';

  // Start with the ACL flag by default set to the following
  //   AND: a successful match will keep the flag on, an unsuccessful match will turn it off
  //   OR: a successful match will OR the flag on, an unsuccessful match will leave it as is.
  let aclMatched = aclCheckType === 'AND';

  let aclChecks = Array.isArray(acl.check) ? acl.check : [acl.check];

  for (const check of aclChecks) {
    let matched = check(auth0UserInfo, pathParameters);
    if (aclCheckType === 'OR') {
      aclMatched = aclMatched || matched;
    } else if (aclCheckType === 'AND') {
      aclMatched = aclMatched && matched;
    }
  }

  return aclMatched;
}

function buildAuthorizerResult(principal: string | number, effect: string, methodArn: string, isAdmin: boolean = false): APIGatewayAuthorizerResult {
  return {
    context: {
      isAdmin
    },
    principalId: principal.toString(),
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
