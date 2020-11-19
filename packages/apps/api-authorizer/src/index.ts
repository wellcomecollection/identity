import {APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent} from "aws-lambda";

export async function lambdaHandler(event: APIGatewayTokenAuthorizerEvent, context: any): Promise<APIGatewayAuthorizerResult> {
    const effect = event.authorizationToken == 'allow' ? 'Allow' : 'Deny'

    return {
        principalId: 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: event.methodArn
                }
            ]
        }
    };
}
