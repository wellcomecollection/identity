# API Gateway

resource "aws_cloudwatch_log_group" "identity_api_gateway_v1_access_log" {
  name              = "API-Gateway-Access-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
  retention_in_days = aws_ssm_parameter.cloudwatch_retention.value

  tags = merge(
    local.common_tags,
    {
      "Name" = "API-Gateway-Access-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
    }
  )
}

resource "aws_cloudwatch_log_group" "identity_api_gateway_v1_execution_log" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
  retention_in_days = aws_ssm_parameter.cloudwatch_retention.value

  tags = merge(
    local.common_tags,
    {
      "Name" = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
    }
  )
}

# Lambda

resource "aws_cloudwatch_log_group" "lambda_authorizer" {
  name              = "/aws/lambda/identity-authorizer-${terraform.workspace}"
  retention_in_days = aws_ssm_parameter.cloudwatch_retention.value

  tags = merge(
    local.common_tags,
    {
      "Name" = "/aws/lambda/identity-authorizer-${terraform.workspace}"
    }
  )
}

resource "aws_cloudwatch_log_group" "lambda_api" {
  name              = "/aws/lambda/identity-api-${terraform.workspace}"
  retention_in_days = aws_ssm_parameter.cloudwatch_retention.value

  tags = merge(
    local.common_tags,
    {
      "Name" = "/aws/lambda/identity-api-${terraform.workspace}"
    }
  )
}
