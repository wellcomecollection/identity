resource "aws_api_gateway_usage_plan" "basic" {
  name = "Basic"

  api_stages {
    api_id = aws_api_gateway_rest_api.identity.id
    stage  = aws_api_gateway_stage.identity_v1.stage_name
  }

  throttle_settings {
    rate_limit  = 10
    burst_limit = 5
  }

  tags = {
    "Name" = "Basic"
  }
}

# Dummy

resource "aws_api_gateway_api_key" "dummy" {
  # Only deploy the dummy client if it's a non-production environment...
  count = lower(terraform.workspace) != "prod" ? 1 : 0

  name = "dummy"

  tags = {
    "Name" = "dummy"
  }
}

resource "aws_api_gateway_usage_plan_key" "dummy" {
  # Only deploy the dummy client if it's a non-production environment...
  count = lower(terraform.workspace) != "prod" ? 1 : 0

  key_id        = aws_api_gateway_api_key.dummy[0].id
  usage_plan_id = aws_api_gateway_usage_plan.basic.id
  key_type      = "API_KEY"
}

# Identity web app

moved {
  from = aws_api_gateway_api_key.account_management_system
  to   = aws_api_gateway_api_key.identity_web_app
}

resource "aws_api_gateway_api_key" "identity_web_app" {
  name = "identity web app${local.environment_qualifier}"

  tags = {
    "Name" = "identity web app"
  }
}

moved {
  from = aws_api_gateway_usage_plan_key.account_management_system
  to   = aws_api_gateway_usage_plan_key.identity_web_app
}

resource "aws_api_gateway_usage_plan_key" "identity_web_app" {
  key_id        = aws_api_gateway_api_key.identity_web_app.id
  usage_plan_id = aws_api_gateway_usage_plan.basic.id
  key_type      = "API_KEY"
}
