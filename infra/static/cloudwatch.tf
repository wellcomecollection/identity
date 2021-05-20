resource "aws_cloudwatch_log_group" "api_gateway_welcome" {
  name = "/aws/apigateway/welcome"

  tags = {
    "Name" = "/aws/apigateway/welcome"
  }
}
