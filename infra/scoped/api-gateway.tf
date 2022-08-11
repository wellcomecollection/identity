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

moved {
  from = aws_api_gateway_resource.users
  to   = module.api_gw_resource_users.aws_api_gateway_resource.resource
}

module "api_gw_resource_users" {
  source = "../modules/api_gateway_resource"

  label     = "/users"
  path_part = "users"

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
}

# /users/:user_id

moved {
  from = aws_api_gateway_resource.users_userid
  to   = module.api_gw_resource_users_userid.aws_api_gateway_resource.resource
}

moved {
  from = aws_api_gateway_method.users_userid_options
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method.options[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_options_204
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method_response.options["204"]
}

moved {
  from = aws_api_gateway_method.users_userid_get
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method.get[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_get_200
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method_response.get_success["200"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_get
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method_response.get_errors
}

moved {
  from = aws_api_gateway_method.users_userid_put
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method.put[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_put_200
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method_response.put_success["200"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_put
  to   = module.api_gw_resource_users_userid.aws_api_gateway_method_response.put_errors
}

module "api_gw_resource_users_userid" {
  source = "../modules/api_gateway_resource"

  label     = "/users/:user_id"
  path_part = "{userId}"

  responses = {
    OPTIONS = ["204"]
    GET     = ["200", "401", "403", "404", "500"]
    PUT     = ["200", "400", "401", "403", "404", "409", "500"]
  }

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = module.api_gw_resource_users.id
}

moved {
  from = aws_api_gateway_resource.users_userid_registration
  to   = module.api_gw_resource_users_registration.aws_api_gateway_resource.resource
}

moved {
  from = aws_api_gateway_method.users_userid_registration_options
  to   = module.api_gw_resource_users_registration.aws_api_gateway_method.options[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_registration_options_204
  to   = module.api_gw_resource_users_registration.aws_api_gateway_method_response.options["204"]
}

moved {
  from = aws_api_gateway_method.users_userid_registration_put
  to   = module.api_gw_resource_users_registration.aws_api_gateway_method.put[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_registration_put_200
  to   = module.api_gw_resource_users_registration.aws_api_gateway_method_response.put_success["200"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_registration_put
  to   = module.api_gw_resource_users_registration.aws_api_gateway_method_response.put_errors
}

moved {
  from = module.api_gw_resource_users_registration
  to   = module.api_gw_resource_users_userid_registration
}

module "api_gw_resource_users_userid_registration" {
  source = "../modules/api_gateway_resource"

  label     = "/users/:user_id/registration"
  path_part = "registration"

  responses = {
    OPTIONS = ["204"]
    PUT     = ["200", "400", "401", "403", "404", "422", "500"]
  }

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = module.api_gw_resource_users_userid.id
}

# /users/:user_id/password

moved {
  from = aws_api_gateway_resource.users_userid_password
  to   = module.api_gw_resource_users_userid_password.aws_api_gateway_resource.resource
}

moved {
  from = aws_api_gateway_method.users_userid_password_options
  to   = module.api_gw_resource_users_userid_password.aws_api_gateway_method.options[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_password_options_204
  to   = module.api_gw_resource_users_userid_password.aws_api_gateway_method_response.options["204"]
}

moved {
  from = aws_api_gateway_method.users_userid_password_put
  to   = module.api_gw_resource_users_userid_password.aws_api_gateway_method.put[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_password_put_200
  to   = module.api_gw_resource_users_userid_password.aws_api_gateway_method_response.put_success["200"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_password_put
  to   = module.api_gw_resource_users_userid_password.aws_api_gateway_method_response.put_errors
}

module "api_gw_resource_users_userid_password" {
  source = "../modules/api_gateway_resource"

  label     = "/users/:user_id/password"
  path_part = "password"

  responses = {
    OPTIONS = ["204"]
    PUT     = ["200", "400", "401", "403", "404", "422", "500"]
  }

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = module.api_gw_resource_users_userid.id
}

# /users/:user_id/deletion-request

moved {
  from = aws_api_gateway_resource.users_userid_deletion-request
  to   = module.api_gw_resource_users_userid_deletion-request.aws_api_gateway_resource.resource
}

moved {
  from = aws_api_gateway_method.users_userid_deletion-request_options
  to   = module.api_gw_resource_users_userid_deletion-request.aws_api_gateway_method.options[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_deletion-request_options_204
  to   = module.api_gw_resource_users_userid_deletion-request.aws_api_gateway_method_response.options["204"]
}

moved {
  from = aws_api_gateway_method.users_userid_deletion-request_put
  to   = module.api_gw_resource_users_userid_deletion-request.aws_api_gateway_method.put[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_deletion-request_put_200
  to   = module.api_gw_resource_users_userid_deletion-request.aws_api_gateway_method_response.put_success["200"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_deletion-request_put_304
  to   = module.api_gw_resource_users_userid_deletion-request.aws_api_gateway_method_response.put_success["304"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_deletion-request_put
  to   = module.api_gw_resource_users_userid_deletion-request.aws_api_gateway_method_response.put_errors
}

module "api_gw_resource_users_userid_deletion-request" {
  source = "../modules/api_gateway_resource"

  label     = "/users/:user_id/deletion-request"
  path_part = "deletion-request"

  responses = {
    OPTIONS = ["204"]
    PUT     = ["200", "304", "401", "403", "404", "500"]
  }

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = module.api_gw_resource_users_userid.id
}

# /users/:user_id/validate

resource "aws_api_gateway_resource" "users_userid_validate" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = module.api_gw_resource_users_userid.id
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

resource "aws_api_gateway_method_response" "users_userid_validate_post" {
  for_each = toset(["401", "403", "404", "429", "500"])

  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_validate.id
  http_method = aws_api_gateway_method.users_userid_validate_post.http_method

  status_code = each.key

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
  parent_id   = module.api_gw_resource_users_userid.id
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
