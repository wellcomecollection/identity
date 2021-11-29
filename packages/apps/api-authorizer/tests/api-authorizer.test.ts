import {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import { createLambdaHandler } from '../src/handler';

const lambdaHandler = createLambdaHandler();

const testUserInfo = {
  userId: 12345678,
  name: 'test name',
  firstName: 'test',
  lastName: 'name',
  email: 'test@example.com',
};

describe('API Authorizer', () => {
  it('rejects requests without an authorization header', async () => {});

  it('rejects requests with an invalid authorization header', async () => {});

  it('rejects requests where the access token is rejected by Auth0', async () => {});

  it('denies requests where the user is accessing an invalid resource', async () => {});

  it('returns the caller ID in the result context', async () => {});
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
