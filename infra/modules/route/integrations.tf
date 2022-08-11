resource "aws_api_gateway_integration" "options" {
  count = var.create_default_integrations && contains(keys(var.responses), "OPTIONS") ? 1 : 0

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = "OPTIONS"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_uri
}

resource "aws_api_gateway_integration" "get" {
  count = var.create_default_integrations && contains(keys(var.responses), "GET") ? 1 : 0

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = "GET"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_uri

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

resource "aws_api_gateway_integration" "put" {
  count = var.create_default_integrations && contains(keys(var.responses), "PUT") ? 1 : 0

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = "PUT"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_uri

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

resource "aws_api_gateway_integration" "post" {
  count = var.create_default_integrations && contains(keys(var.responses), "POST") ? 1 : 0

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = "POST"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_uri
}
