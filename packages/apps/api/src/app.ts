import { Auth0Client } from '@weco/auth0-client';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import {
  changePassword,
  getUser,
  requestDelete,
  resendVerificationEmail,
  updateUser,
  updateUserAfterRegistration,
  validatePassword,
} from './handlers/user';
import { errorHandler } from './handlers/errorHandler';
import { EmailClient } from './utils/EmailClient';
import { SierraClient } from '@weco/sierra-client';

export type Clients = {
  auth0: Auth0Client;
  email: EmailClient;
  sierra: SierraClient;
};

export function createApplication(clients: Clients): Application {
  const app: Application = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(awsServerlessExpressMiddleware.eventContext());

  [
    registerUsersUserIdRegistrationResource,
    registerUsersUserIdResource,
    registerUsersUserIdPasswordResource,
    registerUsersUserIdDeletionRequestResource,
    registerUsersUserIdValidateResource,
    registerUsersUserResendEmailVerificationResource,
  ].forEach((registerEndpoint) => registerEndpoint(clients, app));

  app.use(errorHandler);

  return app;
}

// The handler for this endpoint duplicates a lot of the work in the handler for
// `/users/:user_id` This is deliberate as 1. they may diverge and 2. we can do
//  a check that the user is at the correct stage of the signup process here
function registerUsersUserIdRegistrationResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/registration', corsOptions);
  app.put(
    '/users/:user_id/registration',
    corsOptions,
    asyncHandler(updateUserAfterRegistration(clients.sierra))
  );
}

function registerUsersUserIdResource(clients: Clients, app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id', corsOptions);
  app.get('/users/:user_id', corsOptions, asyncHandler(getUser(clients.auth0)));
  app.put(
    '/users/:user_id',
    corsOptions,
    asyncHandler(updateUser(clients.auth0))
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
    asyncHandler(changePassword(clients.auth0))
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

function registerUsersUserResendEmailVerificationResource(
  clients: Clients,
  app: Application
): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,POST',
    origin: process.env.API_ALLOWED_ORIGINS,
  });
  app.options('/users/:user_id/resend_verification', corsOptions);
  app.post(
    '/users/:user_id/resend_verification',
    corsOptions,
    asyncHandler(resendVerificationEmail(clients.auth0))
  );
}
