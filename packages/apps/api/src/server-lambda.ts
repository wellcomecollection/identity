import app from './app';
import * as awsServerlessExpress from 'aws-serverless-express';
import {APIGatewayProxyEvent, Context} from 'aws-lambda';

const server = awsServerlessExpress.createServer(app, undefined, [])

exports.lambdaHandler = (event: APIGatewayProxyEvent, context: Context) => {
  console.log('Proxying event [' + JSON.stringify(event) + '] with context [' + JSON.stringify(context) + ']');
  awsServerlessExpress.proxy(server, event, context);
};
