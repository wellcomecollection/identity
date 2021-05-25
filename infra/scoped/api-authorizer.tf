resource "aws_api_gateway_authorizer" "token_authorizer" {
  name        = "Token-Authorizer"
  rest_api_id = aws_api_gateway_rest_api.identity.id

  authorizer_uri                   = aws_lambda_alias.authorizer_current.invoke_arn
  identity_source                  = "method.request.header.Authorization"
  type                             = "REQUEST"
  authorizer_result_ttl_in_seconds = 0
}
