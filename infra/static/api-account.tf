resource "aws_api_gateway_account" "main" {
  # There exists a few settings, including the CloudWatch logging ARN, that has to be configured against API Gateway on
  # the account level.
  cloudwatch_role_arn = aws_iam_role.api_gateway_role.arn

  depends_on = [
    aws_cloudwatch_log_group.api_gateway_welcome
  ]
}
