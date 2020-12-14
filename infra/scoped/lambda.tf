# stubs/authorizer.js

resource "aws_lambda_function" "authorizer" {
  function_name = "identity-authorizer-${terraform.workspace}"
  handler       = "index.lambdaHandler"
  role          = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime       = "nodejs12.x"
  filename      = "data/empty.zip"

  environment {
    variables = {
      SIERRA_API_ROOT      = aws_ssm_parameter.sierra_api_hostname.value,
      SIERRA_CLIENT_KEY    = data.external.sierra_api_credentials.result.SierraAPIKey
      SIERRA_CLIENT_SECRET = data.external.sierra_api_credentials.result.SierraAPISecret
      AUTH0_API_ROOT       = local.auth0_endpoint
      AUTH0_API_AUDIENCE   = auth0_client_grant.api_gateway_identity.audience,
      AUTH0_CLIENT_ID      = auth0_client.api_gateway_identity.client_id,
      AUTH0_CLIENT_SECRET  = auth0_client.api_gateway_identity.client_secret
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
  filename      = "data/empty.zip"
  timeout       = 10

  environment {
    variables = {
      SIERRA_API_ROOT      = aws_ssm_parameter.sierra_api_hostname.value,
      SIERRA_CLIENT_KEY    = data.external.sierra_api_credentials.result.SierraAPIKey
      SIERRA_CLIENT_SECRET = data.external.sierra_api_credentials.result.SierraAPISecret
      AUTH0_API_ROOT       = local.auth0_endpoint
      AUTH0_API_AUDIENCE   = auth0_client_grant.api_gateway_identity.audience,
      AUTH0_CLIENT_ID      = auth0_client.api_gateway_identity.client_id,
      AUTH0_CLIENT_SECRET  = auth0_client.api_gateway_identity.client_secret,
      API_ALLOWED_ORIGINS  = local.identity_v1_docs_endpoint
    }
  }

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
