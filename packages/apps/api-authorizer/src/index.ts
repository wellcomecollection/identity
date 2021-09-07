import { Auth0Client, HttpAuth0Client } from '@weco/auth0-client';
import { createNodeRedisClient, WrappedNodeRedisClient } from 'handy-redis';
import { createLambdaHandler } from './handler';

// Place these resources outside of the handler itself, so they can be reused between invocations.
const lambdaAuth0Client: Auth0Client = new HttpAuth0Client(
  process.env.AUTH0_API_ROOT!,
  process.env.AUTH0_API_AUDIENCE!,
  process.env.AUTH0_CLIENT_ID!,
  process.env.AUTH0_CLIENT_SECRET!
);

const lambdaRedisClient: WrappedNodeRedisClient = createNodeRedisClient({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
});

export const lambdaHandler = createLambdaHandler(
  lambdaAuth0Client,
  lambdaRedisClient
);
