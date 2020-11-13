resource "aws_api_gateway_request_validator" "full" {
  name                        = "Full"
  rest_api_id                 = aws_api_gateway_rest_api.identity.id
  validate_request_body       = true
  validate_request_parameters = true
}
