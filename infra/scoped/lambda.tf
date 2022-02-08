# packages/apps/api-authorizer

resource "aws_lambda_function" "authorizer" {
  function_name = "identity-authorizer-${terraform.workspace}"
  handler       = "index.lambdaHandler"
  role          = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime       = "nodejs12.x"

  // This creates an empty function on the first apply, as it will be managed by
  // the deployment scripts and ignored by TF (see lifecycle block)
  filename = "data/empty.zip"

  vpc_config {
    subnet_ids = local.private_subnets

    security_group_ids = [
      aws_security_group.local.id,
      aws_security_group.egress.id
    ]
  }

  environment {
    variables = {
      AUTH0_DOMAIN    = local.auth0_hostname
      IDENTITY_API_ID = auth0_resource_server.identity_api.identifier
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

resource "aws_lambda_alias" "authorizer_current" {
  name             = "current"
  description      = "Current deployment"
  function_name    = aws_lambda_function.authorizer.function_name
  function_version = aws_lambda_function.authorizer.version

  lifecycle {
    ignore_changes = [function_version]
  }
}

resource "aws_lambda_permission" "authorizer" {
  function_name = aws_lambda_function.authorizer.function_name
  qualifier     = aws_lambda_alias.authorizer_current.name

  source_arn   = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
  statement_id = "AllowAPIGatewayInvoke-${terraform.workspace}"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"
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
      AUTH0_API_ROOT      = local.auth0_endpoint
      AUTH0_API_AUDIENCE  = auth0_client_grant.api_gateway_identity.audience,
      AUTH0_CLIENT_ID     = auth0_client.api_gateway_identity.client_id,
      AUTH0_CLIENT_SECRET = auth0_client.api_gateway_identity.client_secret,
      API_ALLOWED_ORIGINS = local.identity_v1_docs_endpoint,
      EMAIL_SMTP_HOSTNAME = local.email_credentials["smtp_hostname"],
      EMAIL_SMTP_PORT     = local.email_credentials["smtp_port"],
      EMAIL_SMTP_USERNAME = local.email_credentials["smtp_username"],
      EMAIL_SMTP_PASSWORD = local.email_credentials["smtp_password"],
      EMAIL_FROM_ADDRESS  = local.email_noreply_name_and_address,
      EMAIL_ADMIN_ADDRESS = aws_ssm_parameter.email_admin_address.value,
      SUPPORT_URL         = aws_ssm_parameter.auth0_support_url.value
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

resource "aws_lambda_alias" "api_current" {
  name             = "current"
  description      = "Current deployment"
  function_name    = aws_lambda_function.api.function_name
  function_version = aws_lambda_function.api.version

  lifecycle {
    ignore_changes = [function_version]
  }
}

resource "aws_lambda_permission" "api" {
  function_name = aws_lambda_function.api.function_name
  qualifier     = aws_lambda_alias.api_current.name

  source_arn   = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
  statement_id = "AllowAPIGatewayInvoke-${terraform.workspace}"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"
}

# packages/apps/patron-deletion-tracker

resource "aws_lambda_function" "patron_deletion_tracker" {
  function_name = "patron-deletion-tracker-${terraform.workspace}"
  handler       = "app.lambdaHandler"
  role          = aws_iam_role.patron_deletion_tracker.arn
  runtime       = "nodejs14.x"

  // This creates an empty function on the first apply, as it will be managed by
  // the deployment scripts and ignored by TF (see lifecycle block)
  filename = "data/empty.zip"

  depends_on = [
    aws_cloudwatch_log_group.lambda_patron_deletion_tracker
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

resource "aws_lambda_alias" "patron_deletion_tracker_current" {
  name             = "current"
  description      = "Current deployment"
  function_name    = aws_lambda_function.patron_deletion_tracker.function_name
  function_version = aws_lambda_function.patron_deletion_tracker.version

  lifecycle {
    ignore_changes = [function_version]
  }
}
