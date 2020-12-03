import express, {Application, Request, Response} from 'express';
import bodyParser from 'body-parser';
import SierraClient from "@weco/sierra-client";
import {validateCredentials} from "./handlers/auth";
import {DummyUserOne, DummyUserTwo} from "./models/user";
import {getUser} from "./handlers/user";
import Auth0Client from "@weco/auth0-client";
import cors from 'cors';

const app: Application = express();

const sierraClient: SierraClient = new SierraClient(
  process.env.SIERRA_API_ROOT!, process.env.SIERRA_CLIENT_KEY!, process.env.SIERRA_CLIENT_SECRET!
);
const auth0Client: Auth0Client = new Auth0Client(
  process.env.AUTH0_API_ROOT!, process.env.AUTH0_API_AUDIENCE!, process.env.AUTH0_CLIENT_ID!, process.env.AUTH0_CLIENT_SECRET!
);

const options: cors.CorsOptions = {
  allowedHeaders: [
    'Authorization',
    'X-API-Key'
  ],
  methods: 'HEAD,GET,PUT,POST,DELETE',
  origin: '*'
};

app.use(cors(options));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/auth', (req: Request, res: Response) => validateCredentials(sierraClient, req, res));
app.get('/users', (req: Request, res: Response) => res.status(200).json([DummyUserOne, DummyUserTwo]));
app.post('/users', (req: Request, res: Response) => res.status(201).json(DummyUserOne));
app.get('/users/:user_id', (req: Request, res: Response) => getUser(sierraClient, auth0Client, req, res));
app.put('/users/:user_id', (req: Request, res: Response) => res.status(200).json(DummyUserOne));
app.delete('/users/:user_id', (req: Request, res: Response) => res.status(204).end());
app.put('/users/:user_id/password', (req: Request, res: Response) => res.status(200).end());
app.put('/users/:user_id/reset-password', (req: Request, res: Response) => res.status(200).end());
app.put('/users/:user_id/send-verification', (req: Request, res: Response) => res.status(200).end());
app.put('/users/:user_id/lock', (req: Request, res: Response) => res.status(200).end());
app.put('/users/:user_id/unlock', (req: Request, res: Response) => res.status(200).end());

export default app;
