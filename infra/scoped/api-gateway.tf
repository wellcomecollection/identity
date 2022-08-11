resource "aws_api_gateway_rest_api" "identity" {
  name = "identity-${terraform.workspace}"

  tags = {
    "Name" = "identity-${terraform.workspace}"
  }
}

resource "aws_cloudwatch_metric_alarm" "alarm_5xx" {
  alarm_name          = "identity-api-${terraform.workspace}-5xx-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "60"
  statistic           = "Sum"
  threshold           = "0"

  dimensions = {
    ApiName = aws_api_gateway_rest_api.identity.name
  }

  alarm_actions = [local.api_gateway_alerts_topic_arn]
}

locals {
  get_method_response_codes  = ["401", "403", "404", "500"]
  post_method_response_codes = ["400", "401", "403", "404", "409", "500"]
  put_method_response_codes  = ["400", "401", "403", "404", "409", "500"]
}

# /users

resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
  path_part   = "users"
}

# /users/:user_id

resource "aws_api_gateway_resource" "users_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{userId}"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [GET]

resource "aws_api_gateway_method" "users_userid_get" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid.id
  http_method          = "GET"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_get_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

moved {
  from = aws_api_gateway_method_response.users_userid_get_401
  to   = aws_api_gateway_method_response.users_userid_get["401"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_get_403
  to   = aws_api_gateway_method_response.users_userid_get["403"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_get_404
  to   = aws_api_gateway_method_response.users_userid_get["404"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_get_500
  to   = aws_api_gateway_method_response.users_userid_get["500"]
}

resource "aws_api_gateway_method_response" "users_userid_get" {
  for_each = toset(local.get_method_response_codes)

  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method

  status_code = each.key

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

moved {
  from = aws_api_gateway_method_response.users_userid_put_400
  to   = aws_api_gateway_method_response.users_userid_put["400"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_put_401
  to   = aws_api_gateway_method_response.users_userid_put["401"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_put_403
  to   = aws_api_gateway_method_response.users_userid_put["403"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_put_404
  to   = aws_api_gateway_method_response.users_userid_put["404"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_put_409
  to   = aws_api_gateway_method_response.users_userid_put["409"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_put_500
  to   = aws_api_gateway_method_response.users_userid_put["500"]
}

resource "aws_api_gateway_method_response" "users_userid_put" {
  for_each = toset(local.put_method_response_codes)

  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method

  status_code = each.key

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/registration
resource "aws_api_gateway_resource" "users_userid_registration" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "registration"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_registration_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_registration.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_registration_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_registration_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_registration.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_registration_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 400 Bad Request

resource "aws_api_gateway_method_response" "users_userid_registration_put_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_put.http_method
  status_code = "400"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 401 Unauthorized

resource "aws_api_gateway_method_response" "users_userid_registration_put_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_put.http_method
  status_code = "401"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_registration_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_registration_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 422 Unprocessable Entity

resource "aws_api_gateway_method_response" "users_userid_registration_put_422" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_put.http_method
  status_code = "422"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_registration_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_registration.id
  http_method = aws_api_gateway_method.users_userid_registration_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/password

resource "aws_api_gateway_resource" "users_userid_password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "password"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_password_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_password.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_password_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_password_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_password.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_password_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 400 Bad Request

resource "aws_api_gateway_method_response" "users_userid_password_put_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "400"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 401 Unauthorized

resource "aws_api_gateway_method_response" "users_userid_password_put_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "401"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_password_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_password_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 422 Unprocessable Entity

resource "aws_api_gateway_method_response" "users_userid_password_put_422" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "422"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_password_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/deletion-request

resource "aws_api_gateway_resource" "users_userid_deletion-request" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "deletion-request"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_deletion-request_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_deletion-request_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_deletion-request_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_deletion-request_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 304 Not Modified

resource "aws_api_gateway_method_response" "users_userid_deletion-request_put_304" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
  status_code = "304"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 401 Unauthorized

resource "aws_api_gateway_method_response" "users_userid_deletion-request_put_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
  status_code = "401"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_deletion-request_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_deletion-request_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_deletion-request_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_deletion-request.id
  http_method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/validate

resource "aws_api_gateway_resource" "users_userid_validate" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "validate"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_validate_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_validate.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_validate_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [POST]

resource "aws_api_gateway_method" "users_userid_validate_post" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_validate.id
  http_method          = "POST"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_validate_post_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 401 Unauthorized

resource "aws_api_gateway_method_response" "users_userid_validate_post_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method
  status_code = "401"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_validate_post_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_validate_post_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 429 Too Many Requests

resource "aws_api_gateway_method_response" "users_userid_validate_post_429" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method
  status_code = "429"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_validate_post_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/item-requests

resource "aws_api_gateway_resource" "users_userid_item-requests" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "item-requests"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_item-requests_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_item-requests.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_item-requests_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [POST]

resource "aws_api_gateway_method" "users_userid_item-requests_post" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_item-requests.id
  http_method          = "POST"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 202 Accepted

resource "aws_api_gateway_method_response" "users_userid_item-requests_post_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_post.http_method
  status_code = "202"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post_400
  to   = aws_api_gateway_method_response.users_userid_item-requests_post["400"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post_401
  to   = aws_api_gateway_method_response.users_userid_item-requests_post["401"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post_403
  to   = aws_api_gateway_method_response.users_userid_item-requests_post["403"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post_404
  to   = aws_api_gateway_method_response.users_userid_item-requests_post["404"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post_409
  to   = aws_api_gateway_method_response.users_userid_item-requests_post["409"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post_500
  to   = aws_api_gateway_method_response.users_userid_item-requests_post["500"]
}

resource "aws_api_gateway_method_response" "users_userid_item-requests_post" {
  for_each = toset(local.post_method_response_codes)

  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_post.http_method

  status_code = each.key

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# [GET]

resource "aws_api_gateway_method" "users_userid_item-requests_get" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_item-requests.id
  http_method          = "GET"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_item-requests_get_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_get_401
  to   = aws_api_gateway_method_response.users_userid_item-requests_get["401"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_get_403
  to   = aws_api_gateway_method_response.users_userid_item-requests_get["403"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_get_404
  to   = aws_api_gateway_method_response.users_userid_item-requests_get["404"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_get_item-requests_500
  to   = aws_api_gateway_method_response.users_userid_item-requests_get["500"]
}

resource "aws_api_gateway_method_response" "users_userid_item-requests_get" {
  for_each = toset(local.get_method_response_codes)

  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_item-requests.id
  http_method = aws_api_gateway_method.users_userid_item-requests_get.http_method

  status_code = each.key

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}
