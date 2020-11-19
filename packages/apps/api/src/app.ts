import express, {Application, Router} from 'express';
import bodyParser from 'body-parser';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/forgot-password', function() {

});

app.get('/users', function (e) {

});

export default app;
