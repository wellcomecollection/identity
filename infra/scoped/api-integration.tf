resource "aws_api_gateway_vpc_link" "requests" {
  name        = "requests-lb-link-${terraform.workspace}"
  target_arns = [aws_lb.identity_api.arn]

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  requests_integration_uri = "http://${local.identity_v1_hostname}:${local.requests_lb_port}/users/{userId}/item-requests"
}

# [OPTIONS] /users/:user_id/item-requests

resource "aws_api_gateway_integration" "users_userid_item-requests_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.userid_routes["/users/:user_id/item-requests"].id
  http_method = "OPTIONS"

  integration_http_method = "OPTIONS"
  type                    = "HTTP_PROXY"
  connection_type         = "VPC_LINK"
  connection_id           = aws_api_gateway_vpc_link.requests.id
  uri                     = local.requests_integration_uri
}


# [POST] /users/:user_id/item-requests

resource "aws_api_gateway_integration" "users_userid_item-requests_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.userid_routes["/users/:user_id/item-requests"].id
  http_method = "POST"

  integration_http_method = "POST"
  type                    = "HTTP_PROXY"
  connection_type         = "VPC_LINK"
  connection_id           = aws_api_gateway_vpc_link.requests.id
  uri                     = local.requests_integration_uri

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"

    // This must be set to pass the context set by the authorizer to the HTTP integration
    // See: https://docs.aws.amazon.com/apigateway/latest/developerguide/request-response-data-mappings.html
    "integration.request.header.X-Wellcome-Caller-ID" = "context.authorizer.callerId"
  }
}

# [GET] /users/:user_id/item-requests

resource "aws_api_gateway_integration" "users_userid_item-requests_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.userid_routes["/users/:user_id/item-requests"].id
  http_method = "GET"

  integration_http_method = "GET"
  type                    = "HTTP_PROXY"
  connection_type         = "VPC_LINK"
  connection_id           = aws_api_gateway_vpc_link.requests.id
  uri                     = local.requests_integration_uri

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"

    // This must be set to pass the context set by the authorizer to the HTTP integration
    // See: https://docs.aws.amazon.com/apigateway/latest/developerguide/request-response-data-mappings.html
    "integration.request.header.X-Wellcome-Caller-ID" = "context.authorizer.callerId"
  }
}
