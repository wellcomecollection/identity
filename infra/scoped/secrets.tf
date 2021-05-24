# Sierra API

resource "aws_secretsmanager_secret" "sierra_api_credentials" {
  name = "sierra-api-credentials-${terraform.workspace}"

  tags = {
    "Name" = "sierra-api-credentials-${terraform.workspace}"
  }
}

data "aws_secretsmanager_secret_version" "sierra_api_credentials-sierra-api-key_version" {
  secret_id = aws_secretsmanager_secret.sierra_api_credentials.id
}

data "external" "sierra_api_credentials" {
  program = ["echo", data.aws_secretsmanager_secret_version.sierra_api_credentials-sierra-api-key_version.secret_string]
}

# Azure AD

resource "aws_secretsmanager_secret" "azure_ad_client_secret" {
  name = "azure-ad-client-secret-${terraform.workspace}"

  tags = {
    "Name" = "azure-ad-client-secret-${terraform.workspace}"
  }
}

data "aws_secretsmanager_secret_version" "azure_ad_client_secret_version" {
  secret_id = aws_secretsmanager_secret.azure_ad_client_secret.id
}

# Email

resource "aws_secretsmanager_secret" "email_smtp_password_secret" {
  name = "email-smtp-password-secret-${terraform.workspace}"

  tags = {
    "Name" = "email-smtp-password-secret-${terraform.workspace}"
  }
}

data "aws_secretsmanager_secret_version" "email_smtp_password_secret_version" {
  secret_id = aws_secretsmanager_secret.email_smtp_password_secret.id
}

# Account Management System
# Create these secrets in the experience account

resource "aws_secretsmanager_secret" "account_management_system-auth0_client_secret" {
  provider = aws.experience
  name     = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"
  }
}

resource "aws_secretsmanager_secret_version" "account_management_system-auth0_client_secret" {
  provider      = aws.experience
  secret_id     = aws_secretsmanager_secret.account_management_system-auth0_client_secret.id
  secret_string = auth0_client.account_management_system.client_secret
}

resource "aws_secretsmanager_secret" "account_management_system-api_key" {
  provider = aws.experience
  name     = "identity/${terraform.workspace}/account_management_system/api_key"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_management_system/api_key"
  }
}

resource "aws_secretsmanager_secret_version" "account_management_system-api_key" {
  provider = aws.experience

  secret_id     = aws_secretsmanager_secret.account_management_system-api_key.id
  secret_string = aws_api_gateway_api_key.account_management_system.value
}

# Create these secrets in the identity account

resource "aws_secretsmanager_secret" "account_management_system-api_key-identity" {
  name = "identity/${terraform.workspace}/account_management_system/api_key"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_management_system/api_key"
  }
}

resource "aws_secretsmanager_secret_version" "account_management_system-api_key-identity" {
  secret_id     = aws_secretsmanager_secret.account_management_system-api_key-identity.id
  secret_string = aws_api_gateway_api_key.account_management_system.value
}

# Account Admin System

resource "aws_secretsmanager_secret" "account_admin_system-auth0_client_secret" {
  name = "identity/${terraform.workspace}/account_admin_system/auth0_client_secret"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_admin_system/auth0_client_secret"
  }
}

resource "aws_secretsmanager_secret_version" "account_admin_system-auth0_client_secret" {
  secret_id     = aws_secretsmanager_secret.account_admin_system-auth0_client_secret.id
  secret_string = auth0_client.account_admin_system.client_secret
}

resource "aws_secretsmanager_secret" "account_admin_system-api_key" {
  name = "identity/${terraform.workspace}/account_admin_system/api_key"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_admin_system/api_key"
  }
}

resource "aws_secretsmanager_secret_version" "account_admin_system-api_key" {
  secret_id     = aws_secretsmanager_secret.account_admin_system-api_key.id
  secret_string = aws_api_gateway_api_key.account_admin_system.value
}

locals {
  elasticsearch_apps  = ["requests"]
  elasticsearch_creds = ["es_username", "es_password", "es_protocol", "es_port"]
}

resource "aws_secretsmanager_secret" "es_credentials" {
  for_each = toset([
    for path in setproduct(local.elasticsearch_apps, local.elasticsearch_creds) : "${path[0]}/${path[1]}"
  ])

  name = "identity/${each.value}"
  tags = {
    // These secrets are currently environment-independent
    "Environment" = "common"
  }
}

# Smoke Test

# The test_user credentials are set manually in SM
data "aws_secretsmanager_secret" "test_user_credentials" {
  name = "identity/${terraform.workspace}/test_user/credentials"
}

data "aws_secretsmanager_secret_version" "test_user_credentials" {
  secret_id = data.aws_secretsmanager_secret.test_user_credentials.id
}

# Setup a JSON secret to store
locals {
  decoded_test_user_credentials = jsondecode(
    data.aws_secretsmanager_secret_version.test_user_credentials.secret_string
  )

  smoke_test_credentials = {
    username : local.decoded_test_user_credentials["username"]
    password : local.decoded_test_user_credentials["password"]
    clientId : auth0_client.smoke_test.id
    clientSecret : auth0_client.smoke_test.client_secret
  }
}

resource "aws_secretsmanager_secret" "smoke_test-auth0_credentials" {
  name = "identity/${terraform.workspace}/smoke_test/credentials"

  tags = {
    "Name" = "identity/${terraform.workspace}/smoke_test/auth0_client_secret"
  }
}

resource "aws_secretsmanager_secret_version" "smoke_test-auth0_credentials" {
  secret_id     = aws_secretsmanager_secret.smoke_test-auth0_credentials.id
  secret_string = jsonencode(local.smoke_test_credentials)
}
