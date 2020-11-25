# [POST] /auth

resource "aws_api_gateway_integration" "auth_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

# [GET] /users

resource "aws_api_gateway_integration" "users_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn

  request_parameters = {
    "integration.request.path.userId"   = "method.request.querystring.page",
    "integration.request.path.pageSize" = "method.request.querystring.pageSize",
    "integration.request.path.query"    = "method.request.querystring.query"
  }
}

# [POST] /users

resource "aws_api_gateway_integration" "users_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

# [GET] /users/:user_id

resource "aws_api_gateway_integration" "users_userid_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn

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
  uri                     = aws_lambda_function.api.invoke_arn

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
  uri                     = aws_lambda_function.api.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [PUT] /users/:user_id/password

resource "aws_api_gateway_integration" "users_userid_password_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [PUT] /users/:user_id/reset-password

resource "aws_api_gateway_integration" "users_userid_reset-password_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [PUT] /users/:user_id/send-verification

resource "aws_api_gateway_integration" "users_userid_send-verification_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [PUT] /users/:user_id/lock

resource "aws_api_gateway_integration" "users_userid_lock_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}

# [PUT] /users/:user_id/unlock

resource "aws_api_gateway_integration" "users_userid_unlock_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_unlock.id
  http_method = aws_api_gateway_method.users_userid_unlock_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn

  request_parameters = {
    "integration.request.path.userId" = "method.request.path.userId"
  }
}
