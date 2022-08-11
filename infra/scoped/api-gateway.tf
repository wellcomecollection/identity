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

moved {
  from = aws_api_gateway_resource.users_userid_validate
  to   = module.api_gw_resource_users_userid_validate.aws_api_gateway_resource.resource
}

moved {
  from = aws_api_gateway_method.users_userid_validate_options
  to   = module.api_gw_resource_users_userid_validate.aws_api_gateway_method.options[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_validate_options_204
  to   = module.api_gw_resource_users_userid_validate.aws_api_gateway_method_response.options["204"]
}

moved {
  from = aws_api_gateway_method.users_userid_validate_post
  to   = module.api_gw_resource_users_userid_validate.aws_api_gateway_method.post[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_validate_post_200
  to   = module.api_gw_resource_users_userid_validate.aws_api_gateway_method_response.post_success["200"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_validate_post
  to   = module.api_gw_resource_users_userid_validate.aws_api_gateway_method_response.post_errors
}

module "api_gw_resource_users_userid_validate" {
  source = "../modules/api_gateway_resource"

  label     = "/users/:user_id/validate"
  path_part = "validate"

  responses = {
    OPTIONS = ["204"]
    POST    = ["200", "401", "403", "404", "429", "500"]
  }

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = module.api_gw_resource_users_userid.id
}

# /users/:user_id/item-requests

moved {
  from = aws_api_gateway_resource.users_userid_item-requests
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_resource.resource
}

moved {
  from = aws_api_gateway_method.users_userid_item-requests_options
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method.options[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_options_204
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method_response.options["204"]
}

moved {
  from = aws_api_gateway_method.users_userid_item-requests_post
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method.post[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post_200
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method_response.post_success["202"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_post
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method_response.post_errors
}

moved {
  from = aws_api_gateway_method.users_userid_item-requests_get
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method.get[0]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_get_200
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method_response.get_success["200"]
}

moved {
  from = aws_api_gateway_method_response.users_userid_item-requests_get
  to   = module.api_gw_resource_users_userid_item-requests.aws_api_gateway_method_response.get_errors
}

module "api_gw_resource_users_userid_item-requests" {
  source = "../modules/api_gateway_resource"

  label     = "/users/:user_id/item-requests"
  path_part = "item-requests"

  responses = {
    OPTIONS = ["204"]
    POST    = ["202", "400", "401", "403", "404", "409", "500"]
    GET     = ["200", "401", "403", "404", "500"]
  }

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = module.api_gw_resource_users_userid.id
}
