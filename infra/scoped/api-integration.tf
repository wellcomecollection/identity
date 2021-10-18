# [OPTIONS] /users

resource "aws_api_gateway_integration" "users_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [GET] /users

resource "aws_api_gateway_integration" "users_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.page"     = "method.request.querystring.page",
    "integration.request.path.pageSize" = "method.request.querystring.pageSize",
    "integration.request.path.sort"     = "method.request.querystring.sort"
    "integration.request.path.sortDir"  = "method.request.querystring.sortDir"
    "integration.request.path.name"     = "method.request.querystring.name"
    "integration.request.path.email"    = "method.request.querystring.email"
    "integration.request.path.status"   = "method.request.querystring.status"
  }

  lifecycle {
    ignore_changes = [
      uri
    ]
  }
}

# [POST] /users

resource "aws_api_gateway_integration" "users_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [OPTIONS] /users/:user_id

resource "aws_api_gateway_integration" "users_userid_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [GET] /users/:user_id

resource "aws_api_gateway_integration" "users_userid_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method

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
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [DELETE] /users/:user_id

resource "aws_api_gateway_integration" "users_userid_delete" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_delete.http_method

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
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/password

resource "aws_api_gateway_integration" "users_userid_password_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [OPTIONS] /users/:user_id/reset-password

resource "aws_api_gateway_integration" "users_userid_reset-password_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/reset-password

resource "aws_api_gateway_integration" "users_userid_reset-password_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [OPTIONS] /users/:user_id/send-verification

resource "aws_api_gateway_integration" "users_userid_send-verification_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/send-verification

resource "aws_api_gateway_integration" "users_userid_send-verification_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [OPTIONS] /users/:user_id/lock

resource "aws_api_gateway_integration" "users_userid_lock_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/lock

resource "aws_api_gateway_integration" "users_userid_lock_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [DELETE] /users/:user_id/lock

resource "aws_api_gateway_integration" "users_userid_lock_delete" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_delete.http_method

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
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_options.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn
}

# [PUT] /users/:user_id/deletion-request

resource "aws_api_gateway_integration" "users_userid_deletion-request_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_alias.api_current.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [DELETE] /users/:user_id/deletion-request

resource "aws_api_gateway_integration" "users_userid_deletion-request_delete" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_delete.http_method

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
