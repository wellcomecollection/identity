import {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import { createLambdaHandler } from '../src/handler';
import { TokenValidator } from '../src/authentication';
import { JsonWebTokenError, Jwt } from 'jsonwebtoken';

const alwaysSucceed = ({
  userId = 'auth0|ptest',
  scopes = [],
}: {
  userId?: string;
  scopes?: string[];
} = {}): TokenValidator => () =>
  Promise.resolve(({
    payload: { sub: userId, scope: scopes.join(' ') },
  } as unknown) as Jwt);

const alwaysFail: TokenValidator = () =>
  Promise.reject(new JsonWebTokenError('invalid token'));

describe('API Authorizer', () => {
  it('rejects requests without an authorization header', async () => {
    const handler = createLambdaHandler(alwaysSucceed());
    const event = createEvent({
      token: undefined,
      resource: '/foo',
      method: 'GET',
    });

    await expect(handler(event)).rejects.toBe('Unauthorized');
  });

  it('rejects requests with an invalid authorization header', async () => {
    const handler = createLambdaHandler(alwaysFail);
    const event = createEvent({
      token: 'INVALID_TOKEN',
      resource: '/foo',
      method: 'GET',
    });

    await expect(handler(event)).rejects.toBe('Unauthorized');
  });

  it('denies requests where the user is accessing an invalid resource', async () => {
    const handler = createLambdaHandler(alwaysSucceed());
    const event = createEvent({
      token: 'VALID_TOKEN',
      resource: '/foo',
      method: 'GET',
    });

    const result = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('denies requests where the caller token has the wrong scopes', async () => {
    const handler = createLambdaHandler(
      alwaysSucceed({ scopes: ['something:else'] })
    );
    const event = createEvent({
      token: 'VALID_TOKEN',
      resource: '/users/{userId}',
      method: 'GET',
      userId: 'me',
    });

    const result = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('allows requests where the caller token has the correct scopes', async () => {
    const handler = createLambdaHandler(
      alwaysSucceed({ scopes: ['read:user'] })
    );
    const event = createEvent({
      token: 'VALID_TOKEN',
      resource: '/users/{userId}',
      method: 'GET',
      userId: 'me',
    });

    const result = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
  });

  it('denies requests where the ID in the token does not match the resource', async () => {
    const handler = createLambdaHandler(
      alwaysSucceed({ scopes: ['read:user'], userId: 'auth0|ptoken_id' })
    );
    const event = createEvent({
      token: 'VALID_TOKEN',
      resource: '/users/{userId}',
      method: 'GET',
      userId: 'not_token_id',
    });

    const result = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
  });

  it('allows requests where the ID in the token matches the resource', async () => {
    const userId = 'test_user';
    const handler = createLambdaHandler(
      alwaysSucceed({ scopes: ['read:user'], userId: 'auth0|p' + userId })
    );
    const event = createEvent({
      token: 'VALID_TOKEN',
      resource: '/users/{userId}',
      method: 'GET',
      userId,
    });

    const result = await handler(event);
    expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
  });

  it('returns the caller ID in the result context', async () => {
    const userId = 'test_user';
    const handler = createLambdaHandler(
      alwaysSucceed({ scopes: ['read:user'], userId: 'auth0|p' + userId })
    );
    const event = createEvent({
      token: 'VALID_TOKEN',
      resource: '/users/{userId}',
      method: 'GET',
      userId: 'me',
    });

    const result = await handler(event);
    expect(result.context?.callerId).toBe(userId);
  });
});

type TestEventParams = {
  token?: string;
  userId?: string;
  resource: string;
  method: string;
};

const createEvent = ({
  token,
  resource,
  method,
  userId,
}: TestEventParams): APIGatewayRequestAuthorizerEvent => ({
  type: 'REQUEST',
  methodArn: '123',
  resource,
  path: '',
  httpMethod: method,
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
  },
  multiValueHeaders: null,
  pathParameters: { userId },
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: <APIGatewayEventRequestContextWithAuthorizer<undefined>>{},
});
