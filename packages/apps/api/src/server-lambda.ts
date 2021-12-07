import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import { Server } from 'http';
import { HttpAuth0Client, Auth0Client } from '@weco/auth0-client';
import { createApplication } from './app';
import HttpEmailClient, { EmailClient } from './utils/EmailClient';

const auth0Client: Auth0Client = new HttpAuth0Client(
  process.env.AUTH0_API_ROOT!,
  process.env.AUTH0_API_AUDIENCE!,
  process.env.AUTH0_CLIENT_ID!,
  process.env.AUTH0_CLIENT_SECRET!
);

const emailClient: EmailClient = new HttpEmailClient(
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
  auth0: auth0Client,
  email: emailClient,
});

const server: Server = awsServerlessExpress.createServer(app, undefined, []);
exports.lambdaHandler = (event: APIGatewayProxyEvent, context: Context) =>
  awsServerlessExpress.proxy(server, event, context);
