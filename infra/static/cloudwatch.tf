resource "aws_cloudwatch_log_group" "api_gateway_welcome" {
  name = "/aws/apigateway/welcome"

  tags = merge(
    local.common_tags,
    {
      "Name" = "/aws/apigateway/welcome"
    }
  )
}
