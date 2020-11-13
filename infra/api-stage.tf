resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  description = timestamp()
}

resource "aws_api_gateway_stage" "v1" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  deployment_id = aws_api_gateway_deployment.deployment.id
  stage_name    = "v1"
}