import {APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent} from 'aws-lambda';
import Auth0Client from '@weco/auth0-client';
import {ResponseStatus} from "@weco/identity-common";

export async function lambdaHandler(event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {

  const AUTH0_API_ROOT: string = process.env.AUTH0_API_ROOT!;
  const AUTH0_API_AUDIENCE: string = process.env.AUTH0_API_AUDIENCE!;
  const AUTH0_CLIENT_ID: string = process.env.AUTH0_CLIENT_ID!;
  const AUTH0_CLIENT_SECRET: string = process.env.AUTH0_CLIENT_SECRET!;

  const auth0Client = new Auth0Client(AUTH0_API_ROOT, AUTH0_API_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET);

  const validateAccessTokenResponse = await auth0Client.validateAccessToken(extractAccessToken(event.headers!.Authorization));
  if (validateAccessTokenResponse.status === ResponseStatus.Success) {
    return buildAuthorizerResult(validateAccessTokenResponse.result.userId, 'Allow', event.methodArn);
  } else {
    return buildAuthorizerResult('user', 'Deny', event.methodArn);
  }
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
