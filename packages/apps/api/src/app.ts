import express, {Application, Request, Response} from 'express';
import bodyParser from 'body-parser';
import SierraClient from "@weco/sierra-client";
import {validateCredentials} from "./handlers/auth";
import {DummyUserOne, DummyUserTwo} from "./models/user";
import {getUser} from "./handlers/user";
import Auth0Client from "@weco/auth0-client";

const app: Application = express();
const sierraClient: SierraClient = new SierraClient(
  process.env.SIERRA_API_ROOT!, process.env.SIERRA_CLIENT_KEY!, process.env.SIERRA_CLIENT_SECRET!
);
const auth0Client: Auth0Client = new Auth0Client(
  process.env.AUTH0_API_ROOT!, process.env.AUTH0_API_AUDIENCE!, process.env.AUTH0_CLIENT_ID!, process.env.AUTH0_CLIENT_SECRET!
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/auth', (req, res) => validateCredentials(sierraClient, req, res));

app.get('/users', function (req: Request, res: Response) {
  console.log('Processing [GET /users]...');
  res.status(200).json([DummyUserOne, DummyUserTwo]);
});

app.post('/users', function (req: Request, res: Response) {
  console.log('Processing [POST /users]...');
  res.status(201).json(DummyUserOne);
});

app.get('/users/:user_id', (req, res) => getUser(sierraClient, auth0Client, req, res));

app.put('/users/:user_id', function (req: Request, res: Response) {
  console.log('Processing [PUT /users/:user_id]...');
  res.status(200).json(DummyUserOne);
});

app.delete('/users/:user_id', function (req: Request, res: Response) {
  console.log('Processing [DELETE /users/:user_id]...');
  res.status(204).end();
});

app.put('/users/:user_id/password', function (req: Request, res: Response) {
  console.log('Processing [PUT /users/:user_id/password]...');
  res.status(200).end();
});

app.put('/users/:user_id/reset-password', function (req: Request, res: Response) {
  console.log('Processing [PUT /users/:user_id/reset-password]...');
  res.status(200).end();
});

app.put('/users/:user_id/send-verification', function (req: Request, res: Response) {
  console.log('Processing [PUT /users/:user_id/send-verification]...');
  res.status(200).end();
});

app.put('/users/:user_id/lock', function (req: Request, res: Response) {
  console.log('Processing [PUT /users/:user_id/lock]...');
  res.status(200).end();
});

app.put('/users/:user_id/unlock', function (req: Request, res: Response) {
  console.log('Processing [PUT /users/:user_id/unlock]...');
  res.status(200).end();
});

export default app;
