import { APIGatewayAuthorizerResult, PolicyDocument } from 'aws-lambda';

export const policyDocument = ({
  effect,
  resource,
}: {
  effect: 'Allow' | 'Deny';
  resource: string;
}): PolicyDocument => ({
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource,
    },
  ],
});

export const authorizerResult = ({
  policyDocument,
  principalId,
}: {
  policyDocument: PolicyDocument;
  principalId: string;
  callerId?: string;
}): APIGatewayAuthorizerResult => ({
  context: { callerId: principalId },
  principalId,
  policyDocument,
});

// This is the way we signal a 401 to API Gateway
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
export const send401 = () => {
  throw 'Unauthorized';
};
