import Auth0Client from '@weco/auth0-client';
import SierraClient from '@weco/sierra-client';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { validateCredentials } from './handlers/auth';
import { changePassword, createUser, getUser, updateUser } from './handlers/user';
import { DummyUserOne, DummyUserTwo } from './models/user';

export default createApplication();

const sierraClient: SierraClient = new SierraClient(
  process.env.SIERRA_API_ROOT!, process.env.SIERRA_CLIENT_KEY!, process.env.SIERRA_CLIENT_SECRET!
);

const auth0Client: Auth0Client = new Auth0Client(
  process.env.AUTH0_API_ROOT!, process.env.AUTH0_API_AUDIENCE!, process.env.AUTH0_CLIENT_ID!, process.env.AUTH0_CLIENT_SECRET!
);

function createApplication(): Application {
  const app: Application = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  registerAuthResource(app);
  registerUsersResource(app);
  registerUsersUserIdResource(app);
  registerUsersUserIdPasswordResource(app);
  registerUsersUserIdResetPasswordResource(app);
  registerUsersUserIdSendVerificationResource(app);
  registerUsersUserIdLockResource(app);
  registerUsersUserIdUnlockResource(app);

  return app;
}

function registerAuthResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'X-API-Key'],
    methods: 'OPTIONS,POST',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/auth', cors(corsOptions));
  app.post('/auth', cors(corsOptions), (request: Request, response: Response) => validateCredentials(auth0Client, request, response));
}

function registerUsersResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,POST',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/users', cors(corsOptions));
  app.get('/users', cors(corsOptions), (request: Request, response: Response) => response.status(200).json([DummyUserOne, DummyUserTwo]));
  app.post('/users', cors(corsOptions), (request: Request, response: Response) => createUser(sierraClient, auth0Client, request, response));
}

function registerUsersUserIdResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,GET,PUT,DELETE',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/users/:user_id', cors(corsOptions));
  app.get('/users/:user_id', cors(corsOptions), (request: Request, response: Response) => getUser(sierraClient, auth0Client, request, response));
  app.put('/users/:user_id', cors(corsOptions), (request: Request, response: Response) => updateUser(sierraClient, auth0Client, request, response));
  app.delete('/users/:user_id', cors(corsOptions), (request: Request, response: Response) => response.status(204).end());
}

function registerUsersUserIdPasswordResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/users/:user_id/password', cors(corsOptions));
  app.put('/users/:user_id/password', cors(corsOptions), (request: Request, response: Response) => changePassword(sierraClient, auth0Client, request, response));
}

function registerUsersUserIdResetPasswordResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/users/:user_id/reset-password', cors(corsOptions));
  app.put('/users/:user_id/reset-password', cors(corsOptions), (request: Request, response: Response) => response.status(200).end());
}

function registerUsersUserIdSendVerificationResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/users/:user_id/send-verification', cors(corsOptions));
  app.put('/users/:user_id/send-verification', cors(corsOptions), (request: Request, response: Response) => response.status(200).end());
}

function registerUsersUserIdLockResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/users/:user_id/lock', cors(corsOptions));
  app.put('/users/:user_id/lock', cors(corsOptions), (request: Request, response: Response) => response.status(200).end());
}

function registerUsersUserIdUnlockResource(app: Application): void {
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    methods: 'OPTIONS,PUT',
    origin: process.env.API_ALLOWED_ORIGINS
  }
  app.options('/users/:user_id/unlock', cors(corsOptions));
  app.put('/users/:user_id/unlock', cors(corsOptions), (request: Request, response: Response) => response.status(200).end());
}
