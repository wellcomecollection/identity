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

  // The 'Authorization' header is not present.
  if (!event.headers?.Authorization) {
    console.log('Authorization header is not present on request');
    return buildAuthorizerResult('user', 'Deny', event.methodArn);
  }

  // Extract the access token from the 'Authorization' header. Reject the request if it's not present, or if it's not a
  // valid bearer token.
  const authorizationHeader = event.headers.Authorization;
  const accessToken = extractAccessToken(authorizationHeader);
  if (!accessToken) {
    console.log('Authorization header [' + authorizationHeader + '] is not a valid bearer token');
    return buildAuthorizerResult(authorizationHeader, 'Deny', event.methodArn);
  }

  // Validate the access token against Auth0 for validity. Auth0 will either explicitly reject the access token as not
  // being valid, or some other unknown error may occur with the Auth0 API.
  const auth0Validate = await auth0Client.validateAccessToken(accessToken);
  if (auth0Validate.status != ResponseStatus.Success) {
    if (auth0Validate.status == ResponseStatus.InvalidCredentials) {
      console.log('Access token token [' + accessToken + '] rejected by Auth0: ' + auth0Validate.message);
      return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
    } else {
      console.log('Unknown error processing access token [' + accessToken + ']: ' + auth0Validate.message);
      return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
    }
  }

  // We've validated the access token, now fetch the user ID from the request path. If it's not present, we can't
  // continue.
  if (!event.pathParameters?.userId) {
    return buildAuthorizerResult(auth0Validate.result.userId, 'Allow', event.methodArn);
  }

  // Finally, validate the access token alongside the request path and embedded user ID. If that doesn't work out, then
  // reject the request.
  if (!validateRequest(auth0Validate.result, event.pathParameters, event.resource, <ResourceAclMethod>event.httpMethod)) {
    console.log('Access token [' + accessToken + '] for user [' + JSON.stringify(auth0Validate.result) + '] cannot operate on ID [' + event.pathParameters.userId + ']');
    return buildAuthorizerResult(auth0Validate.result.userId, 'Deny', event.methodArn);
  }

  // Everything looks good.
  return buildAuthorizerResult(auth0Validate.result.userId, 'Allow', event.methodArn);
}

function extractAccessToken(tokenString: string): null | string {
  const match = tokenString.match(/^Bearer (.*)$/);
  return !match || match.length < 2 ? null : match[1];
}

type ResourceAclMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ResourceAclCheckType = 'AND' | 'OR';
type ResourceAclCheck = (user: Auth0UserInfo, params: Record<string, string>) => boolean;

type ResourceAcl = {
  resource: string,
  methods: ResourceAclMethod[],
  check: ResourceAclCheck | Array<ResourceAclCheck>,
  checkType?: ResourceAclCheckType
};

const isAdministrator = function (user: Auth0UserInfo, params: Record<string, string>): boolean {
  return false; // @todo
};

const isSelf = function (user: Auth0UserInfo, params: Record<string, string>): boolean {
  return params.userId === user.userId.toString();
};

const resourceAcls: ResourceAcl[] = [
  {
    resource: '/users',
    methods: ['GET'],
    check: isAdministrator
  },
  {
    resource: '/users/{userId}',
    methods: ['GET', 'PUT', 'DELETE'],
    check: isSelf,
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
    check: [isAdministrator],
  },
  {
    resource: '/users/{userId}/reset-password',
    methods: ['PUT'],
    check: [isAdministrator],
  },
  {
    resource: '/users/{userId}/lock',
    methods: ['PUT'],
    check: [isAdministrator],
  },
  {
    resource: '/users/{userId}/unlock',
    methods: ['PUT'],
    check: [isAdministrator],
  },
];

function validateRequest(auth0UserInfo: Auth0UserInfo, pathParameters: { [name: string]: string }, resource: string, method: ResourceAclMethod): boolean {
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
    if (aclCheckType == 'OR') {
      aclMatched = aclMatched || matched;
    } else if (aclCheckType == 'AND') {
      aclMatched = aclMatched && matched;
    }
  }

  return aclMatched;
}

function buildAuthorizerResult(principal: string | number, effect: string, methodArn: string): APIGatewayAuthorizerResult {
  return {
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
