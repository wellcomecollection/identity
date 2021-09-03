import {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import { createLambdaHandler } from '../src/handler';
import { MockAuth0Client } from '@weco/auth0-client';
import { WrappedNodeRedisClient } from 'handy-redis';

const mockAuth0Client = new MockAuth0Client();
const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
};

const lambdaHandler = createLambdaHandler(
  mockAuth0Client,
  (mockRedis as unknown) as WrappedNodeRedisClient
);

const testUserInfo = {
  userId: 12345678,
  name: 'test name',
  firstName: 'test',
  lastName: 'name',
  email: 'test@example.com',
};

describe('API Authorizer', () => {
  afterEach(() => {
    mockAuth0Client.reset();
  });

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

    try {
      await lambdaHandler(event);
    } catch (e) {
      expect(e).toEqual('Unauthorized');
    }
  });

  it('denies requests where the access token has insufficient privileges for the requested resource', async () => {
    mockAuth0Client.addUser(testUserInfo);
    const token = mockAuth0Client.getAccessToken(testUserInfo.userId);

    const event = createEvent({
      token: token,
      resource: '/users',
      method: 'GET',
    });

    const result = await lambdaHandler(event);
    expect(result).toHaveProperty('policyDocument.Statement.0.Effect', 'Deny');
  });

  it('allows requests where the access token has sufficient privileges for the requested resource', async () => {
    mockAuth0Client.addAdminUser(testUserInfo);
    const token = mockAuth0Client.getAccessToken(testUserInfo.userId);
    const event = createEvent({
      token,
      resource: '/users',
      method: 'GET',
    });

    const result = await lambdaHandler(event);
    expect(result).toHaveProperty('policyDocument.Statement.0.Effect', 'Allow');
  });

  it('denies requests where the user is accessing an invalid resource', async () => {
    mockAuth0Client.addUser(testUserInfo);
    const token = mockAuth0Client.getAccessToken(testUserInfo.userId);
    const event = createEvent({
      token,
      resource: '/users/{userId}/ice_cream',
      method: 'GET',
      userId: testUserInfo.userId.toString(),
    });

    const result = await lambdaHandler(event);
    expect(result).toHaveProperty('policyDocument.Statement.0.Effect', 'Deny');
  });

  it('uses cached user info when available', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify(testUserInfo));
    mockAuth0Client.addUser(testUserInfo);
    const token = mockAuth0Client.getAccessToken(testUserInfo.userId);
    const event = createEvent({
      token: token,
      resource: '/users/{userId}/password',
      method: 'PUT',
      userId: testUserInfo.userId.toString(),
    });
    const result = await lambdaHandler(event);

    expect(result).toHaveProperty('policyDocument.Statement.0.Effect', 'Allow');
    expect(mockAuth0Client.validateAccessToken).not.toHaveBeenCalledWith(token);

    // Reset the mock :(
    mockRedis.get.mockResolvedValue(null);
  });

  it('returns the caller ID and admin status in the result context', async () => {
    mockAuth0Client.addUser(testUserInfo);
    const token = mockAuth0Client.getAccessToken(testUserInfo.userId);
    const event = createEvent({
      token,
      resource: '/users/{userId}/password',
      method: 'PUT',
      userId: testUserInfo.userId.toString(),
    });

    const result = await lambdaHandler(event);
    expect(result).toHaveProperty(
      'context.callerId',
      testUserInfo.userId.toString()
    );
    expect(result).toHaveProperty('context.isAdmin', false);
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
