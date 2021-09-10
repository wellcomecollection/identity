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


// TODO: These are here to remember what state to update in prod
// TODO: Remove these once fully applied in prod
//resource "aws_secretsmanager_secret" "account_management_system-auth0_client_secret" {
//  provider = aws.experience
//  name     = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"
//
//  tags = {
//    "Name" = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"
//  }
//}
//
//resource "aws_secretsmanager_secret_version" "account_management_system-auth0_client_secret" {
//  provider      = aws.experience
//  secret_id     = aws_secretsmanager_secret.account_management_system-auth0_client_secret.id
//  secret_string = auth0_client.account_management_system.client_secret
//}
//
//resource "aws_secretsmanager_secret" "account_management_system-api_key" {
//  provider = aws.experience
//  name     = "identity/${terraform.workspace}/account_management_system/api_key"
//
//  tags = {
//    "Name" = "identity/${terraform.workspace}/account_management_system/api_key"
//  }
//}
//
//resource "aws_secretsmanager_secret_version" "account_management_system-api_key" {
//  provider = aws.experience
//
//  secret_id     = aws_secretsmanager_secret.account_management_system-api_key.id
//  secret_string = aws_api_gateway_api_key.account_management_system.value
//}

//resource "aws_secretsmanager_secret" "account_management_system-api_key-identity" {
//  name = "identity/${terraform.workspace}/account_management_system/api_key"
//
//  tags = {
//    "Name" = "identity/${terraform.workspace}/account_management_system/api_key"
//  }
//}
//
//resource "aws_secretsmanager_secret_version" "account_management_system-api_key-identity" {
//  secret_id     = aws_secretsmanager_secret.account_management_system-api_key-identity.id
//  secret_string = aws_api_gateway_api_key.account_management_system.value
//}

//locals {
//  elasticsearch_apps  = ["requests"]
//  elasticsearch_creds = ["es_username", "es_password", "es_protocol", "es_port"]
//}
//
//resource "aws_secretsmanager_secret" "es_credentials" {
//  for_each = toset([
//    for path in setproduct(local.elasticsearch_apps, local.elasticsearch_creds) : "${path[0]}/${path[1]}"
//  ])
//
//  name = "identity/${terraform.workspace}/${each.value}"
//}

//resource "aws_secretsmanager_secret" "buildkite-auth0_credentials" {
//  name = "identity/${terraform.workspace}/buildkite/credentials"
//
//  tags = {
//    "Name" = "identity/${terraform.workspace}/buildkite/auth0_client_secret"
//  }
//}
//
//resource "aws_secretsmanager_secret_version" "buildkite-auth0_credentials" {
//  secret_id     = aws_secretsmanager_secret.buildkite-auth0_credentials.id
//  secret_string = jsonencode(local.buildkite_credentials)
//}

//resource "aws_secretsmanager_secret" "smoke_test-auth0_credentials" {
//  name = "identity/${terraform.workspace}/smoke_test/credentials"
//
//  tags = {
//    "Name" = "identity/${terraform.workspace}/smoke_test/auth0_client_secret"
//  }
//}
//
//resource "aws_secretsmanager_secret_version" "smoke_test-auth0_credentials" {
//  secret_id     = aws_secretsmanager_secret.smoke_test-auth0_credentials.id
//  secret_string = jsonencode(local.smoke_test_credentials)
//}
