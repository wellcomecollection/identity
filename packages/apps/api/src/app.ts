import { Auth0Client } from '@weco/auth0-client';
import { SierraClient } from '@weco/sierra-client';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import {
  changePassword,
  getUser,
  requestDelete,
  updateUser,
  validatePassword,
} from './handlers/user';
import { errorHandler } from './handlers/errorHandler';
import { EmailClient } from './utils/EmailClient';

export type Clients = {
  sierra: SierraClient;
  auth0: Auth0Client;
  email: EmailClient;
};

export function createApplication(clients: Clients): Application {
  const app: Application = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(awsServerlessExpressMiddleware.eventContext());

  [
    registerUsersUserIdResource,
    registerUsersUserIdPasswordResource,
    registerUsersUserIdDeletionRequestResource,
    registerUsersUserIdValidateResource,
  ].forEach((registerEndpoint) => registerEndpoint(clients, app));

  app.use(errorHandler);

  return app;
}

function registerUsersUserIdResource(clients: Clients, app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id', corsOptions);
  app.get(
    '/users/:user_id',
    corsOptions,
    asyncHandler(getUser(clients.sierra, clients.auth0))
  );
  app.put(
    '/users/:user_id',
    corsOptions,
    asyncHandler(updateUser(clients.sierra, clients.auth0))
  );
}

function registerUsersUserIdPasswordResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/password', corsOptions);
  app.put(
    '/users/:user_id/password',
    corsOptions,
    asyncHandler(changePassword(clients.sierra, clients.auth0))
  );
}

function registerUsersUserIdDeletionRequestResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/deletion-request', corsOptions);
  app.put(
    '/users/:user_id/deletion-request',
    corsOptions,
    asyncHandler(requestDelete(clients.auth0, clients.email))
  );
}

function registerUsersUserIdValidateResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,POST',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/validate', corsOptions);
  app.post(
    '/users/:user_id/validate',
    corsOptions,
    asyncHandler(validatePassword(clients.auth0))
  );
}
