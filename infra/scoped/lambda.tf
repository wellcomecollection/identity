# packages/apps/api-authorizer

resource "aws_lambda_function" "authorizer" {
  function_name = "identity-authorizer-${terraform.workspace}"
  handler       = "index.lambdaHandler"
  role          = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime       = "nodejs12.x"
  filename      = "data/empty.zip"

  vpc_config {
    subnet_ids = local.private_subnets

    security_group_ids = [
      aws_security_group.local.id,
      aws_security_group.egress.id
    ]
  }

  environment {
    variables = {
      AUTH0_API_ROOT      = local.auth0_endpoint
      AUTH0_API_AUDIENCE  = auth0_client_grant.api_gateway_identity.audience,
      AUTH0_CLIENT_ID     = auth0_client.api_gateway_identity.client_id,
      AUTH0_CLIENT_SECRET = auth0_client.api_gateway_identity.client_secret,
      REDIS_HOST          = aws_elasticache_replication_group.access_token_cache.primary_endpoint_address
      REDIS_PORT          = aws_elasticache_replication_group.access_token_cache.port
      REDIS_CACHE_TTL     = aws_ssm_parameter.redis_access_token_cache_ttl.value
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

  tags = {
    "name" = "identity-authorizer-${terraform.workspace}"
  }
}

resource "aws_lambda_permission" "authorizer" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

resource "aws_lambda_alias" "authorizer_current" {
  name             = "current"
  function_name    = aws_lambda_function.authorizer.function_name
  function_version = aws_lambda_function.authorizer.version

  lifecycle {
    ignore_changes = [function_version]
  }
}

# packages/apps/api

resource "aws_lambda_function" "api" {
  function_name = "identity-api-${terraform.workspace}"
  handler       = "server-lambda.lambdaHandler"
  role          = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime       = "nodejs12.x"
  filename      = "data/empty.zip"
  timeout       = 10

  vpc_config {
    subnet_ids = local.private_subnets

    security_group_ids = [
      aws_security_group.local.id,
      aws_security_group.egress.id
    ]
  }

  environment {
    variables = {
      SIERRA_API_ROOT      = aws_ssm_parameter.sierra_api_hostname.value,
      SIERRA_CLIENT_KEY    = data.external.sierra_api_credentials.result.SierraAPIKey
      SIERRA_CLIENT_SECRET = data.external.sierra_api_credentials.result.SierraAPISecret
      AUTH0_API_ROOT       = local.auth0_endpoint
      AUTH0_API_AUDIENCE   = auth0_client_grant.api_gateway_identity.audience,
      AUTH0_CLIENT_ID      = auth0_client.api_gateway_identity.client_id,
      AUTH0_CLIENT_SECRET  = auth0_client.api_gateway_identity.client_secret,
      API_ALLOWED_ORIGINS  = local.identity_v1_docs_endpoint,
      EMAIL_SMTP_HOSTNAME  = aws_ssm_parameter.email_smtp_hostname.value,
      EMAIL_SMTP_PORT      = aws_ssm_parameter.email_smtp_port.value,
      EMAIL_SMTP_USERNAME  = aws_ssm_parameter.email_smtp_username.value,
      EMAIL_SMTP_PASSWORD  = data.aws_secretsmanager_secret_version.email_smtp_password_secret_version.secret_string,
      EMAIL_FROM_ADDRESS   = local.email_noreply_name_and_address,
      EMAIL_ADMIN_ADDRESS  = aws_ssm_parameter.email_admin_address.value,
      SUPPORT_URL          = aws_ssm_parameter.auth0_support_url.value
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

  tags = {
    "name" = "identity-authorizer-${terraform.workspace}"
  }
}

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

resource "aws_lambda_alias" "api_current" {
  name             = "current"
  function_name    = aws_lambda_function.api.function_name
  function_version = aws_lambda_function.api.version

  lifecycle {
    ignore_changes = [function_version]
  }
}
