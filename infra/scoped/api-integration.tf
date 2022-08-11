# [OPTIONS] /users/:user_id

resource "aws_api_gateway_integration" "users_userid_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid.id
  http_method = "OPTIONS"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [GET] /users/:user_id

resource "aws_api_gateway_integration" "users_userid_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid.id
  http_method = "GET"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [PUT] /users/:user_id

resource "aws_api_gateway_integration" "users_userid_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid.id
  http_method = "PUT"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [OPTIONS] /users/:user_id/password

resource "aws_api_gateway_integration" "users_userid_password_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid_password.id
  http_method = "OPTIONS"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/password

resource "aws_api_gateway_integration" "users_userid_password_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid_password.id
  http_method = "PUT"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [OPTIONS] /users/:user_id/registration

resource "aws_api_gateway_integration" "users_userid_registration_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid_registration.id
  http_method = "OPTIONS"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/registration

resource "aws_api_gateway_integration" "users_userid_registration_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid_registration.id
  http_method = "PUT"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}


# [OPTIONS] /users/:user_id/deletion-request

resource "aws_api_gateway_integration" "users_userid_deletion-request_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid_deletion-request.id
  http_method = "OPTIONS"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/deletion-request

resource "aws_api_gateway_integration" "users_userid_deletion-request_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = module.api_gw_resource_users_userid_deletion-request.id
  http_method = "PUT"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [OPTIONS] /users/:user_id/validate

resource "aws_api_gateway_integration" "users_userid_validate_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [POST] /users/:user_id/validate

resource "aws_api_gateway_integration" "users_userid_validate_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

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
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_options.http_method

  integration_http_method = aws_api_gateway_method.users_userid_item-requests_options.http_method
  type                    = "HTTP_PROXY"
  connection_type         = "VPC_LINK"
  connection_id           = aws_api_gateway_vpc_link.requests.id
  uri                     = local.requests_integration_uri
}


# [POST] /users/:user_id/item-requests

resource "aws_api_gateway_integration" "users_userid_item-requests_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_post.http_method

  integration_http_method = aws_api_gateway_method.users_userid_item-requests_post.http_method
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
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_get.http_method

  integration_http_method = aws_api_gateway_method.users_userid_item-requests_get.http_method
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
