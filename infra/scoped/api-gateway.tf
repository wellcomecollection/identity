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

module "api_gw_resource_users" {
  source = "../modules/api_gateway_resource"

  label     = "/users"
  path_part = "users"

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
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
