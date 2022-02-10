# API Authorizer

This is a [Lambda authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) for the Identity API. It sits in between API Gateway and the API Lambda, checks that requests are authorized, and accepts/denies the requests as appropriate.

It checks that access tokens are valid: this is possible because they are signed (by Auth0) using public/private key cryptography. It also checks that they have the correct scopes, and injects the user ID into the Lambda event even if the URL parameter is "me".
