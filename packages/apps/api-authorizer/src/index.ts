import {APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent} from 'aws-lambda';
import Auth0Client from '@weco/auth0-client';

export async function lambdaHandler(event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {

  const AUTH0_API_ROOT: string = process.env.AUTH0_API_ROOT!;

  console.log('Processing authorizer event [' + JSON.stringify(event) + ']');
  const accessToken = extractAccessToken(event.headers!.Authorization);

  return new Auth0Client(AUTH0_API_ROOT).validateAccessToken(accessToken).then(auth0Profile => {
    return buildAuthorizerResult(auth0Profile.userId, 'Allow', event.methodArn);
  }).catch(() => {
    return buildAuthorizerResult('user', 'Deny', event.methodArn);
  });
}

function extractAccessToken(tokenString: string): string {
  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error('Invalid Authorization token [' + tokenString + '] does not match [Bearer .*]');
  }
  return match[1];
}

function buildAuthorizerResult(principal: string, effect: string, methodArn: string): APIGatewayAuthorizerResult {
  return {
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
