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

  if (event.headers && event.headers.Authorization) {

    const authorizationHeader = event.headers.Authorization;
    const accessToken = extractAccessToken(authorizationHeader);

    if (!accessToken) {
      console.log('Authorization header [' + authorizationHeader + '] is not a valid bearer token');
      return buildAuthorizerResult(authorizationHeader, 'Deny', event.methodArn);
    }

    return auth0Client.validateAccessToken(accessToken).then(response => {
      if (response.status === ResponseStatus.Success) {
        if (event.pathParameters && event.pathParameters.userId) {
          if (validateRequest(response.result, event.pathParameters, event.resource, event.httpMethod)) {
            return buildAuthorizerResult(response.result.userId, 'Allow', event.methodArn);
          } else {
            console.log('Access token [' + accessToken + '] for user [' + JSON.stringify(response.result) + '] cannot operate on ID [' + event.pathParameters.userId + ']');
            return buildAuthorizerResult(response.result.userId, 'Deny', event.methodArn);
          }
        } else {
          return buildAuthorizerResult(response.result.userId, 'Allow', event.methodArn);
        }
      } else if (response.status == ResponseStatus.InvalidCredentials) {
        console.log('Access token token [' + accessToken + '] rejected by Auth0: ' + response.message);
        return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
      } else {
        console.log('Unknown error processing access token [' + accessToken + ']: ' + response.message);
        return buildAuthorizerResult(accessToken, 'Deny', event.methodArn);
      }
    });
  } else {
    return buildAuthorizerResult('user', 'Deny', event.methodArn);
  }
}

function extractAccessToken(tokenString: string): null | string {
  const match = tokenString.match(/^Bearer (.*)$/);
  return !match || match.length < 2 ? null : match[1];
}

function validateRequest(auth0UserInfo: Auth0UserInfo, pathParameters: { [name: string]: string }, resource: string, method: string): boolean {
  // TODO Can we do this better? We need to be able to determine if the resource and method that is being operated on is
  // accessible to the user for whom the request is being made on behalf of. Hardcoding the resource and methods like
  // this doesn't seem very good...
  const userId: string = auth0UserInfo.userId.toString();
  const targetUserId: string = pathParameters.userId;

  if (resource === '/users' && method === 'GET') {
    return false; // TODO Only accessible to administrators
  } else if (resource === '/users/{userId}' && (method === 'GET' || method === 'PUT' || method === 'DELETE')) {
    return userId === targetUserId; // TODO Accessible to both users and administrators
  } else if (resource === '/users/{userId}/password' && method === 'PUT') {
    return userId === targetUserId; // TODO Accessible to both users and administrators
  } else if (resource === '/users/{userId}/send-verification' && method === 'PUT') {
    return false; // TODO Only accessible to administrators
  } else if (resource === '/users/{userId}/lock' && method === 'PUT') {
    return false; // TODO Only accessible to administrators
  } else if (resource === '/users/{userId}/unlock' && method === 'PUT') {
    return false; // TODO Only accessible to administrators
  }

  return false;
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
