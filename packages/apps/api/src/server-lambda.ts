import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import { Server } from 'http';
import { HttpSierraClient, SierraClient } from '@weco/sierra-client';
import { HttpAuth0Client, Auth0Client } from '@weco/auth0-client';
import { createApplication } from './app';
import EmailClient from './utils/email';

const sierraClient: SierraClient = new HttpSierraClient(
  process.env.SIERRA_API_ROOT!,
  process.env.SIERRA_CLIENT_KEY!,
  process.env.SIERRA_CLIENT_SECRET!
);

const auth0Client: Auth0Client = new HttpAuth0Client(
  process.env.AUTH0_API_ROOT!,
  process.env.AUTH0_API_AUDIENCE!,
  process.env.AUTH0_CLIENT_ID!,
  process.env.AUTH0_CLIENT_SECRET!
);

const emailClient: EmailClient = new EmailClient(
  {
    host: process.env.EMAIL_SMTP_HOSTNAME!,
    port: Number(process.env.EMAIL_SMTP_PORT!),
    secure: Boolean(process.env.EMAIL_SMTP_SECURE!),
    auth: {
      user: process.env.EMAIL_SMTP_USERNAME!,
      pass: process.env.EMAIL_SMTP_PASSWORD!,
    },
  },
  process.env.EMAIL_FROM_ADDRESS!,
  process.env.EMAIL_ADMIN_ADDRESS!,
  process.env.SUPPORT_URL!
);

const app = createApplication({
  sierra: sierraClient,
  auth0: auth0Client,
  email: emailClient,
});

const server: Server = awsServerlessExpress.createServer(app, undefined, []);
exports.lambdaHandler = (event: APIGatewayProxyEvent, context: Context) =>
  awsServerlessExpress.proxy(server, event, context);
