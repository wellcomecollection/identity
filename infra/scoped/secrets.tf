# Sierra credentials
# These are set manually (we can't provision Sierra in TF)
resource "aws_secretsmanager_secret" "sierra_api_credentials" {
  name = "sierra-api-credentials-${terraform.workspace}"
}

data "aws_secretsmanager_secret_version" "sierra_api_credentials-sierra-api-key_version" {
  secret_id = aws_secretsmanager_secret.sierra_api_credentials.id
}

# The Sierra user credentials used in e2e tests are also set manually
resource "aws_secretsmanager_secret" "test_user_credentials" {
  name = "identity/${terraform.workspace}/test_user/credentials"
}

data "aws_secretsmanager_secret_version" "test_user_credentials" {
  secret_id = aws_secretsmanager_secret.test_user_credentials.id
}

# OpenAthens configuration
resource "aws_secretsmanager_secret" "openathens_callback_url" {
  name = "identity/${terraform.workspace}/openathens_callback_url"
}

data "aws_secretsmanager_secret_version" "openathens_callback_url" {
  secret_id = aws_secretsmanager_secret.openathens_callback_url.id
}

# auth0 action configuration
resource "aws_secretsmanager_secret" "redirect_action_url" {
  name = "identity/${terraform.workspace}/redirect_action_url"
}

data "aws_secretsmanager_secret_version" "redirect_action_url" {
  secret_id = data.aws_secretsmanager_secret.redirect_action_url.id
}

resource "aws_secretsmanager_secret" "redirect_action_secret" {
  name = "identity/${terraform.workspace}/redirect_action_secret"
}

data "aws_secretsmanager_secret_version" "redirect_action_secret" {
  secret_id = data.aws_secretsmanager_secret.redirect_action_secret.id
}

# Email provider credentials
# From the "static" stack - credentials are from mailtrap.io in stage and SES in prod
data "aws_secretsmanager_secret_version" "email_credentials_secret_version" {
  secret_id = data.terraform_remote_state.identity_static.outputs.email_credential_secret_ids[terraform.workspace]
}

# Prepare credentials we need to jsondecode or re-map
locals {
  sierra_api_credentials_decoded = jsondecode(
    data.aws_secretsmanager_secret_version.sierra_api_credentials-sierra-api-key_version.secret_string
  )

  sierra_api_credentials = {
    client_key    = local.sierra_api_credentials_decoded["SierraAPIKey"]
    client_secret = local.sierra_api_credentials_decoded["SierraAPISecret"]
  }

  test_user_credentials_decoded = jsondecode(
    data.aws_secretsmanager_secret_version.test_user_credentials.secret_string
  )

  smoke_test_credentials = {
    username : local.test_user_credentials_decoded["username"]
    password : local.test_user_credentials_decoded["password"]
    clientId : auth0_client.smoke_test.id
    clientSecret : auth0_client.smoke_test.client_secret
  }

  buildkite_credentials = {
    clientId : auth0_client.buildkite.id
    clientSecret : auth0_client.buildkite.client_secret
  }
}

# Secrets that we set in the identity account
module "secrets" {
  source = "github.com/wellcomecollection/terraform-aws-secrets?ref=v1.3.0"

  key_value_map = {
    "identity/${terraform.workspace}/account_management_system/api_key" = aws_api_gateway_api_key.account_management_system.value
    "identity/${terraform.workspace}/buildkite/credentials"             = jsonencode(local.buildkite_credentials)
    "identity/${terraform.workspace}/smoke_test/credentials"            = jsonencode(local.smoke_test_credentials)
  }
}

# Secrets that need to be exported to the experience account
module "secrets_experience" {
  source = "github.com/wellcomecollection/terraform-aws-secrets?ref=v1.3.0"

  key_value_map = {
    "identity/${terraform.workspace}/account_management_system/auth0_client_secret" = auth0_client.account_management_system.client_secret
    "identity/${terraform.workspace}/account_management_system/api_key"             = aws_api_gateway_api_key.account_management_system.value
  }

  providers = {
    aws = aws.experience
  }
}
