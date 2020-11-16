resource "aws_api_gateway_deployment" "identity_deployment" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  description = timestamp()
}

resource "aws_api_gateway_stage" "identity_v1" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  deployment_id = aws_api_gateway_deployment.identity_deployment.id
  stage_name    = local.identity_v1
}

resource "aws_api_gateway_domain_name" "identity_v1" {
  certificate_arn = aws_acm_certificate_validation.identity_api_v1.certificate_arn
  domain_name     = local.identity_v1_hostname

  tags = merge(
    local.common_tags,
    map(
      "name", local.identity_v1_hostname
    )
  )
}

resource "aws_api_gateway_base_path_mapping" "identity_v1" {
  api_id      = aws_api_gateway_rest_api.identity.id
  domain_name = local.identity_v1_hostname
  stage_name  = aws_api_gateway_stage.identity_v1.stage_name
}
