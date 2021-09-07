import { Auth0Client } from '@weco/auth0-client';
import { SierraClient } from '@weco/sierra-client';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import {
  changePassword,
  createUser,
  deleteUser,
  getUser,
  lockUser,
  removeDelete,
  removeUserLock,
  requestDelete,
  searchUsers,
  sendPasswordResetEmail,
  sendVerificationEmail,
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
    registerUsersResource,
    registerUsersUserIdResource,
    registerUsersUserIdPasswordResource,
    registerUsersUserIdResetPasswordResource,
    registerUsersUserIdSendVerificationResource,
    registerUsersUserIdLockResource,
    registerUsersUserIdDeletionRequestResource,
    registerUsersUserIdValidateResource,
  ].forEach((registerEndpoint) => registerEndpoint(clients, app));

  app.use(errorHandler);

  return app;
}

function registerUsersResource(clients: Clients, app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,POST',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users', corsOptions);
  app.get('/users', corsOptions, asyncHandler(searchUsers(clients.auth0)));
  app.post(
    '/users',
    corsOptions,
    asyncHandler(createUser(clients.sierra, clients.auth0))
  );
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
  app.delete(
    '/users/:user_id',
    corsOptions,
    asyncHandler(deleteUser(clients.sierra, clients.auth0))
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

function registerUsersUserIdResetPasswordResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/reset-password', corsOptions);
  app.put(
    '/users/:user_id/reset-password',
    corsOptions,
    asyncHandler(sendPasswordResetEmail(clients.auth0))
  );
}

function registerUsersUserIdSendVerificationResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/send-verification', corsOptions);
  app.put(
    '/users/:user_id/send-verification',
    corsOptions,
    asyncHandler(sendVerificationEmail(clients.auth0))
  );
}

function registerUsersUserIdLockResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/lock', corsOptions);
  app.put(
    '/users/:user_id/lock',
    corsOptions,
    asyncHandler(lockUser(clients.auth0))
  );
  app.delete(
    '/users/:user_id/lock',
    corsOptions,
    asyncHandler(removeUserLock(clients.auth0))
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
  app.delete(
    '/users/:user_id/deletion-request',
    corsOptions,
    asyncHandler(removeDelete(clients.auth0, clients.email))
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
