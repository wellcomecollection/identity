resource "aws_api_gateway_integration" "options" {
  count = contains(var.integration_methods, "OPTIONS") ? 1 : 0

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = "OPTIONS"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_uri
}
