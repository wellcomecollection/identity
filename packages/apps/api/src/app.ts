import Auth0Client from '@weco/auth0-client';
import { SierraClient } from '@weco/sierra-client';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
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
import EmailClient from './utils/email';

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

  return app;
}

function registerUsersResource(clients: Clients, app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,POST',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users', corsOptions);
  app.get('/users', corsOptions, (request: Request, response: Response) =>
    searchUsers(clients.auth0, request, response)
  );
  app.post('/users', corsOptions, (request: Request, response: Response) =>
    createUser(clients.sierra, clients.auth0, request, response)
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
    (request: Request, response: Response) =>
      getUser(clients.sierra, clients.auth0, request, response)
  );
  app.put(
    '/users/:user_id',
    corsOptions,
    (request: Request, response: Response) =>
      updateUser(clients.sierra, clients.auth0, request, response)
  );
  app.delete(
    '/users/:user_id',
    corsOptions,
    (request: Request, response: Response) =>
      deleteUser(clients.sierra, clients.auth0, request, response)
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
    (request: Request, response: Response) =>
      changePassword(clients.sierra, clients.auth0, request, response)
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
    (request: Request, response: Response) =>
      sendPasswordResetEmail(clients.auth0, request, response)
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
    (request: Request, response: Response) =>
      sendVerificationEmail(clients.auth0, request, response)
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
    (request: Request, response: Response) =>
      lockUser(clients.auth0, request, response)
  );
  app.delete(
    '/users/:user_id/lock',
    corsOptions,
    (request: Request, response: Response) =>
      removeUserLock(clients.auth0, request, response)
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
    (request: Request, response: Response) =>
      requestDelete(clients.auth0, clients.email, request, response)
  );
  app.delete(
    '/users/:user_id/deletion-request',
    corsOptions,
    (request: Request, response: Response) =>
      removeDelete(clients.auth0, clients.email, request, response)
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
    (request: Request, response: Response) =>
      validatePassword(clients.auth0, request, response)
  );
}
