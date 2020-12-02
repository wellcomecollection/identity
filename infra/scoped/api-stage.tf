resource "aws_api_gateway_deployment" "identity_deployment" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  description = "<empty>"
}

resource "aws_api_gateway_stage" "identity_v1" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  deployment_id = aws_api_gateway_deployment.identity_deployment.id
  stage_name    = local.identity_v1

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.identity_api_gateway_v1_access_log.arn
    format          = data.aws_ssm_parameter.api_gateway_log_format.value
  }

  depends_on = [
    aws_cloudwatch_log_group.identity_api_gateway_v1_access_log
  ]

  lifecycle {
    ignore_changes = [
      deployment_id
    ]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = local.identity_v1
    }
  )
}

resource "aws_api_gateway_method_settings" "identity_v1" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  stage_name  = aws_api_gateway_stage.identity_v1.stage_name
  method_path = "*/*" # Applies this logging configuration to all methods automatically

  settings {
    metrics_enabled    = true
    logging_level      = "INFO"
    data_trace_enabled = true
  }

  depends_on = [
    aws_cloudwatch_log_group.identity_api_gateway_v1_execution_log
  ]
}

resource "aws_api_gateway_domain_name" "identity_v1" {
  certificate_arn = aws_acm_certificate_validation.identity_api_v1.certificate_arn
  domain_name     = local.identity_v1_hostname

  tags = merge(
    local.common_tags,
    {
      "Name" = local.identity_v1_hostname
    }
  )
}

resource "aws_api_gateway_base_path_mapping" "identity_v1" {
  api_id      = aws_api_gateway_rest_api.identity.id
  domain_name = local.identity_v1_hostname
  stage_name  = aws_api_gateway_stage.identity_v1.stage_name
}
