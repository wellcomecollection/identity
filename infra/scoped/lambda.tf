# packages/apps/api-authorizer

module "authorizer_lambda" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda.git?ref=v1.1.1"

  name = "identity-authorizer-${terraform.workspace}"

  handler = "index.lambdaHandler"
  runtime = "nodejs18.x"

  // This creates an empty function on the first apply, as it will be managed by
  // the deployment scripts and ignored by TF (see lifecycle block)
  filename = "data/empty.zip"

  // Although usually the authorizer takes about 2ms to run, sometimes we see longer
  // durations, even up to timeouts (with the AWS default of 3s).
  // My guess (17/3/2022) is that there's a delay in fetching the JWKS keys,
  // so this timeout of 30s matches that of the JWKS client:
  // https://github.com/auth0/node-jwks-rsa
  timeout = 30

  vpc_config = {
    subnet_ids = local.private_subnets

    security_group_ids = [
      aws_security_group.local.id,
      aws_security_group.egress.id
    ]
  }

  environment = {
    variables = {
      AUTH0_DOMAIN    = local.auth0_hostname
      IDENTITY_API_ID = auth0_resource_server.identity_api.identifier
    }
  }

  lambda_tags = {
    "name" = "identity-authorizer-${terraform.workspace}"
  }
}

resource "aws_lambda_alias" "authorizer_current" {
  name             = "current"
  description      = "Current deployment"
  function_name    = module.authorizer_lambda.lambda.function_name
  function_version = module.authorizer_lambda.lambda.version

  lifecycle {
    ignore_changes = [function_version]
  }
}

resource "aws_lambda_permission" "authorizer" {
  function_name = module.authorizer_lambda.lambda.function_name
  qualifier     = aws_lambda_alias.authorizer_current.name

  source_arn   = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
  statement_id = "AllowAPIGatewayInvoke-${terraform.workspace}"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"
}

# packages/apps/api

module "api_lambda" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda.git?ref=v1.1.1"

  name     = "identity-api-${terraform.workspace}"
  handler  = "server-lambda.lambdaHandler"
  runtime  = "nodejs12.x"
  filename = "data/empty.zip"
  timeout  = 10

  vpc_config = {
    subnet_ids = local.private_subnets

    security_group_ids = [
      aws_security_group.local.id,
      aws_security_group.egress.id
    ]
  }

  environment = {
    variables = {
      AUTH0_API_ROOT       = local.auth0_endpoint
      AUTH0_API_AUDIENCE   = auth0_client_grant.api_gateway_identity.audience,
      AUTH0_CLIENT_ID      = auth0_client.api_gateway_identity.client_id,
      AUTH0_CLIENT_SECRET  = auth0_client.api_gateway_identity.client_secret,
      API_ALLOWED_ORIGINS  = local.identity_v1_docs_endpoint,
      EMAIL_SMTP_HOSTNAME  = local.email_credentials["smtp_hostname"],
      EMAIL_SMTP_PORT      = local.email_credentials["smtp_port"],
      EMAIL_SMTP_USERNAME  = local.email_credentials["smtp_username"],
      EMAIL_SMTP_PASSWORD  = local.email_credentials["smtp_password"],
      EMAIL_FROM_ADDRESS   = local.email_noreply_name_and_address,
      EMAIL_ADMIN_ADDRESS  = aws_ssm_parameter.email_admin_address.value,
      SUPPORT_URL          = local.auth0_support_url
      SIERRA_API_ROOT      = local.sierra_api_hostname
      SIERRA_CLIENT_KEY    = local.sierra_api_credentials.client_key
      SIERRA_CLIENT_SECRET = local.sierra_api_credentials.client_secret
    }
  }

  lambda_tags = {
    "name" = "identity-authorizer-${terraform.workspace}"
  }
}

resource "aws_lambda_alias" "api_current" {
  name             = "current"
  description      = "Current deployment"
  function_name    = module.api_lambda.lambda.function_name
  function_version = module.api_lambda.lambda.version

  lifecycle {
    ignore_changes = [function_version]
  }
}

resource "aws_lambda_permission" "api" {
  function_name = module.api_lambda.lambda.function_name
  qualifier     = aws_lambda_alias.api_current.name

  source_arn   = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
  statement_id = "AllowAPIGatewayInvoke-${terraform.workspace}"
  action       = "lambda:InvokeFunction"
  principal    = "apigateway.amazonaws.com"
}

# packages/apps/patron-deletion-tracker

module "patron_deletion_tracker_lambda" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda.git?ref=v1.1.1"

  name    = "patron-deletion-tracker-${terraform.workspace}"
  handler = "lambda.handler"
  runtime = "nodejs14.x"
  timeout = 15 * local.one_minute_s // This is the maximum

  // This creates an empty function on the first apply, as it will be managed by
  // the deployment scripts and ignored by TF (see lifecycle block)
  filename = "data/empty.zip"

  dead_letter_config = {
    target_arn = aws_sqs_queue.deletion_lambda_dlq.arn
  }

  environment = {
    variables = {
      AUTH0_API_ROOT       = local.auth0_endpoint
      AUTH0_API_AUDIENCE   = auth0_client_grant.deletion_tracker.audience
      AUTH0_CLIENT_ID      = auth0_client.deletion_tracker.client_id
      AUTH0_CLIENT_SECRET  = auth0_client.deletion_tracker.client_secret
      SIERRA_API_ROOT      = local.sierra_api_hostname
      SIERRA_CLIENT_KEY    = local.sierra_api_credentials.client_key
      SIERRA_CLIENT_SECRET = local.sierra_api_credentials.client_secret
    }
  }

  lambda_tags = {
    "name" = "patron-deletion-tracker-${terraform.workspace}"
  }
}

resource "aws_lambda_alias" "patron_deletion_tracker_current" {
  name             = "current"
  description      = "Current deployment"
  function_name    = module.patron_deletion_tracker_lambda.lambda.function_name
  function_version = module.patron_deletion_tracker_lambda.lambda.version

  lifecycle {
    ignore_changes = [function_version]
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_patron_deletion_tracker" {
  statement_id = "AllowExecutionFromCloudWatch"
  action       = "lambda:InvokeFunction"
  principal    = "events.amazonaws.com"

  function_name = module.patron_deletion_tracker_lambda.lambda.function_name
  source_arn    = aws_cloudwatch_event_rule.patron_deletion_tracker.arn
}
