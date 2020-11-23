# stubs/authorizer.js

resource "aws_lambda_function" "authorizer" {
  function_name = "identity-authorizer-${terraform.workspace}"
  handler       = "index.lambdaHandler"
  role          = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime       = "nodejs12.x"

  environment {
    variables = {
      AUTH0_API_ROOT = "https://${local.auth0_hostname}"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_authorizer
  ]

  lifecycle {
    ignore_changes = [
      filename
    ]
  }

  tags = merge(
    local.common_tags,
    {
      "name" = "identity-authorizer-${terraform.workspace}"
    }
  )
}

resource "aws_lambda_permission" "authorizer" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

# packages/apps/api

resource "aws_lambda_function" "api" {
  function_name = "identity-api-${terraform.workspace}"
  handler       = "server-lambda.lambdaHandler"
  role          = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime       = "nodejs12.x"

  depends_on = [
    aws_cloudwatch_log_group.lambda_api
  ]

  lifecycle {
    ignore_changes = [
      filename
    ]
  }

  tags = merge(
    local.common_tags,
    {
      "name" = "identity-authorizer-${terraform.workspace}"
    }
  )
}

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}
