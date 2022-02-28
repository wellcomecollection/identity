import { ScheduledHandler } from 'aws-lambda';
import { HttpSierraClient, SierraClient } from '@weco/sierra-client';
import { Auth0Client, HttpAuth0Client } from '@weco/auth0-client';
import { createApp } from './app';

const auth0Client: Auth0Client = new HttpAuth0Client(
  process.env.AUTH0_API_ROOT!,
  process.env.AUTH0_API_AUDIENCE!,
  process.env.AUTH0_CLIENT_ID!,
  process.env.AUTH0_CLIENT_SECRET!
);

const sierraClient: SierraClient = new HttpSierraClient(
  process.env.SIERRA_API_ROOT!,
  process.env.SIERRA_CLIENT_KEY!,
  process.env.SIERRA_CLIENT_SECRET!
);

export const handler: ScheduledHandler = createApp(auth0Client, sierraClient);
