import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import { Server } from "http";
import app from './app';

const server: Server = awsServerlessExpress.createServer(app, undefined, [])
exports.lambdaHandler = (event: APIGatewayProxyEvent, context: Context) => awsServerlessExpress.proxy(server, event, context);
