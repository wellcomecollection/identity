import {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import { createLambdaHandler } from '../src/handler';
import { ResponseStatus } from '@weco/identity-common';
import Auth0Client, { Auth0UserInfo } from '@weco/auth0-client';
import { WrappedNodeRedisClient } from 'handy-redis';

const mockAuth0Client = jest.createMockFromModule<{ default: Auth0Client }>(
  '@weco/auth0-client'
).default;
const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
};

const lambdaHandler = createLambdaHandler(
  mockAuth0Client,
  (mockRedis as unknown) as WrappedNodeRedisClient
);

describe('API Authorizer', () => {
  it('rejects requests without an authorization header', async () => {
    const event = createEvent({
      token: undefined,
      resource: '/foo',
      method: 'GET',
    });

    try {
      await lambdaHandler(event);
    } catch (e) {
      expect(e).toEqual('Unauthorized');
    }
  });

  it('rejects requests with an invalid authorization header', async () => {
    const event = {
      ...createEvent({
        resource: '/foo',
        method: 'GET',
      }),
      Headers: {
        Authorization: 'bad garbage nonsense',
      },
    };

    try {
      await lambdaHandler(event);
    } catch (e) {
      expect(e).toEqual('Unauthorized');
    }
  });

  it('rejects requests where the access token is rejected by Auth0', async () => {
    const event = createEvent({
      token: 'test token',
      resource: '/foo',
      method: 'GET',
    });

    await withAuth0Response(
      { status: ResponseStatus.InvalidCredentials },
      async () => {
        try {
          await lambdaHandler(event);
        } catch (e) {
          expect(e).toEqual('Unauthorized');
        }
      }
    );
  });

  it('denies requests where the access token has insufficient privileges for the requested resource', async () => {
    const event = createEvent({
      token: 'test token',
      resource: '/users',
      method: 'GET',
    });

    await withAuth0Response(
      {
        status: ResponseStatus.Success,
        result: {
          userId: 'test',
          name: 'test name',
          firstName: 'test',
          lastName: 'name',
          email: 'test@example.com',
          additionalAttributes: {
            is_admin: false,
          },
        },
      },
      async () => {
        const result = await lambdaHandler(event);
        expect(result).toHaveProperty(
          'policyDocument.Statement.0.Effect',
          'Deny'
        );
      }
    );
  });

  it('allows requests where the access token has sufficient privileges for the requested resource', async () => {
    const userId = 'test_id';
    const event = createEvent({
      token: 'test token',
      resource: '/users/{userId}/password',
      method: 'PUT',
      userId,
    });

    await withAuth0Response(
      {
        status: ResponseStatus.Success,
        result: {
          userId,
          name: 'test name',
          firstName: 'test',
          lastName: 'name',
          email: 'test@example.com',
        },
      },
      async () => {
        const result = await lambdaHandler(event);
        expect(result).toHaveProperty(
          'policyDocument.Statement.0.Effect',
          'Allow'
        );
      }
    );
  });

  it('uses cached user info when available', async () => {
    mockRedis.get.mockResolvedValue(
      JSON.stringify({
        userId: 'test',
        name: 'test name',
        firstName: 'test',
        lastName: 'name',
        email: 'test@example.com',
        additionalAttributes: {
          is_admin: true,
        },
      })
    );
    mockAuth0Client.validateAccessToken = jest.fn();
    const event = createEvent({
      token: 'test token',
      resource: '/users',
      method: 'GET',
    });
    const result = await lambdaHandler(event);

    expect(result).toHaveProperty('policyDocument.Statement.0.Effect', 'Allow');
    expect(mockAuth0Client.validateAccessToken).not.toHaveBeenCalled();

    // Reset the mock :(
    mockRedis.get.mockResolvedValue(null);
  });

  it('returns the caller ID and admin status in the result context', async () => {
    const userId = 'test_id';
    const event = createEvent({
      token: 'test token',
      resource: '/users/{userId}/password',
      method: 'PUT',
      userId,
    });

    await withAuth0Response(
      {
        status: ResponseStatus.Success,
        result: {
          userId,
          name: 'test name',
          firstName: 'test',
          lastName: 'name',
          email: 'test@example.com',
        },
      },
      async () => {
        const result = await lambdaHandler(event);
        expect(result).toHaveProperty('context.callerId', userId);
        expect(result).toHaveProperty('context.isAdmin', false);
      }
    );
  });
});

const withAuth0Response = async (
  { status, result }: { status: ResponseStatus; result?: Auth0UserInfo },
  test: () => Promise<void>
) => {
  mockAuth0Client.validateAccessToken = jest
    .fn()
    .mockResolvedValue(
      result && status === ResponseStatus.Success
        ? { result, status }
        : { message: 'error', status }
    );
  const testResult = await test();
  ((mockAuth0Client as unknown) as jest.Mock<Auth0Client>).mockReset();
  return testResult;
};

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
