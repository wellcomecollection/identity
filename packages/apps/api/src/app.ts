import Auth0Client from '@weco/auth0-client';
import SierraClient from '@weco/sierra-client';
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
  validatePassword
} from './handlers/user';
import EmailClient from "./utils/email";

export default createApplication();

const sierraClient: SierraClient = new SierraClient(
  process.env.SIERRA_API_ROOT!, process.env.SIERRA_CLIENT_KEY!, process.env.SIERRA_CLIENT_SECRET!
);

const auth0Client: Auth0Client = new Auth0Client(
  process.env.AUTH0_API_ROOT!, process.env.AUTH0_API_AUDIENCE!, process.env.AUTH0_CLIENT_ID!, process.env.AUTH0_CLIENT_SECRET!
);

const emailClient: EmailClient = new EmailClient({
  host: process.env.EMAIL_SMTP_HOSTNAME!,
  port: Number(process.env.EMAIL_SMTP_PORT!),
  secure: Boolean(process.env.EMAIL_SMTP_SECURE!),
  auth: {
    user: process.env.EMAIL_SMTP_USERNAME!,
    pass: process.env.EMAIL_SMTP_PASSWORD!
  }
}, process.env.EMAIL_FROM_ADDRESS!, process.env.EMAIL_ADMIN_ADDRESS!, process.env.SUPPORT_URL!);

function createApplication(): Application {
  const app: Application = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(awsServerlessExpressMiddleware.eventContext());

  registerUsersResource(app);
  registerUsersUserIdResource(app);
  registerUsersUserIdPasswordResource(app);
  registerUsersUserIdResetPasswordResource(app);
  registerUsersUserIdSendVerificationResource(app);
  registerUsersUserIdLockResource(app);
  registerUsersUserIdDeletionRequestResource(app);
  registerUsersUserIdValidateResource(app);

  return app;
}

function registerUsersResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,POST',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users', corsOptions);
  app.get('/users', corsOptions, (request: Request, response: Response) => searchUsers(auth0Client, request, response));
  app.post('/users', corsOptions, (request: Request, response: Response) => createUser(sierraClient, auth0Client, request, response));
}

function registerUsersUserIdResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users/:user_id', corsOptions);
  app.get('/users/:user_id', corsOptions, (request: Request, response: Response) => getUser(sierraClient, auth0Client, request, response));
  app.put('/users/:user_id', corsOptions, (request: Request, response: Response) => updateUser(sierraClient, auth0Client, request, response));
  app.delete('/users/:user_id', corsOptions, (request: Request, response: Response) => deleteUser(sierraClient, auth0Client, request, response));
}

function registerUsersUserIdPasswordResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users/:user_id/password', corsOptions);
  app.put('/users/:user_id/password', corsOptions, (request: Request, response: Response) => changePassword(sierraClient, auth0Client, request, response));
}

function registerUsersUserIdResetPasswordResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users/:user_id/reset-password', corsOptions);
  app.put('/users/:user_id/reset-password', corsOptions, (request: Request, response: Response) => sendPasswordResetEmail(auth0Client, request, response));
}

function registerUsersUserIdSendVerificationResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users/:user_id/send-verification', corsOptions);
  app.put('/users/:user_id/send-verification', corsOptions, (request: Request, response: Response) => sendVerificationEmail(auth0Client, request, response));
}

function registerUsersUserIdLockResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users/:user_id/lock', corsOptions);
  app.put('/users/:user_id/lock', corsOptions, (request: Request, response: Response) => lockUser(auth0Client, request, response));
  app.delete('/users/:user_id/lock', corsOptions, (request: Request, response: Response) => removeUserLock(auth0Client, request, response));
}

function registerUsersUserIdDeletionRequestResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users/:user_id/deletion-request', corsOptions);
  app.put('/users/:user_id/deletion-request', corsOptions, (request: Request, response: Response) => requestDelete(auth0Client, emailClient, request, response));
  app.delete('/users/:user_id/deletion-request', corsOptions, (request: Request, response: Response) => removeDelete(auth0Client, emailClient, request, response));
}

function registerUsersUserIdValidateResource(app: Application): void {
  const corsOptions = cors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,POST',
    origin: process.env.API_ALLOWED_ORIGINS
  });
  app.options('/users/:user_id/validate', corsOptions);
  app.post('/users/:user_id/validate', corsOptions, (request: Request, response: Response) => validatePassword(auth0Client, request, response));
}
