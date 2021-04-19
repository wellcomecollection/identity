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

  tags = merge(
    local.common_tags,
    {
      "Name" = "Basic"
    }
  )
}

# Dummy

resource "aws_api_gateway_api_key" "dummy" {
  # Only deploy the dummy client if it's a non-production environment...
  count = lower(terraform.workspace) != "prod" ? 1 : 0

  name = "dummy"

  tags = merge(
    local.common_tags,
    {
      "Name" = "dummy"
    }
  )
}

resource "aws_api_gateway_usage_plan_key" "dummy" {
  # Only deploy the dummy client if it's a non-production environment...
  count = lower(terraform.workspace) != "prod" ? 1 : 0

  key_id        = aws_api_gateway_api_key.dummy[0].id
  usage_plan_id = aws_api_gateway_usage_plan.basic.id
  key_type      = "API_KEY"
}

# Account Management System

resource "aws_api_gateway_api_key" "account_management_system" {
  name = "account management system"

  tags = merge(
    local.common_tags,
    {
      "Name" = "account management system"
    }
  )
}

resource "aws_api_gateway_usage_plan_key" "account_management_system" {
  key_id        = aws_api_gateway_api_key.account_management_system.id
  usage_plan_id = aws_api_gateway_usage_plan.basic.id
  key_type      = "API_KEY"
}

# Account Admin System

resource "aws_api_gateway_api_key" "account_admin_system" {
  name = "account admin system"

  tags = merge(
    local.common_tags,
    {
      "Name" = "account admin system"
    }
  )
}

resource "aws_api_gateway_usage_plan_key" "account_admin_system" {
  key_id        = aws_api_gateway_api_key.account_admin_system.id
  usage_plan_id = aws_api_gateway_usage_plan.basic.id
  key_type      = "API_KEY"
}
