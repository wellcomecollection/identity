import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';

type Handler = (
  event: APIGatewayRequestAuthorizerEvent
) => Promise<APIGatewayAuthorizerResult>;

// TODO implementation
export const createLambdaHandler = () => ({} as Handler);
