import express, {Application, Request, Response} from 'express';
import bodyParser from 'body-parser';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/auth', function (req: Request, res: Response) {
  console.log('Processing [POST /auth]...');
  res.status(200).end();
});

app.get('/users', function (req: Request, res: Response) {
  console.log('Processing [GET /users]...');
  res.status(200).json([user_one, user_two]);
});

app.post('/users', function (req: Request, res: Response) {
  console.log('Processing [POST /users]...');
  res.status(201).json(user_one);
});

app.get('/users/:user_id', function (req: Request, res: Response) {
  console.log('Processing [GET /users/:user_id]...');
  res.status(200).json(user_one);
});

app.put('/users/:user_id', function (req: Request, res: Response) {
  console.log('Processing [PUT /users/:user_id]...');
  res.status(200).json(user_one);
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

const user_one = {
  patronId: "123456",
  barcode: "654321",
  title: "Mr",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  emailValidated: true,
  locked: false,
  creationDate: "2020-11-01 00:00:00",
  lastLogin: "2020-11-01 12:00:00",
  lastLoginIp: "127.0.0.1",
  totalLogins: 120
};

const user_two = {
  patronId: "654321",
  barcode: "123456",
  title: "Mrs",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  emailValidated: true,
  locked: false,
  creationDate: "2020-11-11 00:00:00",
  lastLogin: "2020-11-11 12:00:00",
  lastLoginIp: "192.168.0.1",
  totalLogins: 240
};

export default app;
