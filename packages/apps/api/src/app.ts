import express, {Application, Router} from 'express';
import bodyParser from 'body-parser';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



export default app;
